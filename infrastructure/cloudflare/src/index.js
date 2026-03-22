/**
 * Maiki Cloudflare Edge Worker
 * Handles caching, rate limiting, security, and API routing at the edge
 */

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100,
  window: 60, // seconds
};

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// Security headers
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.maiki.ai;",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const clientIP = request.headers.get("CF-Connecting-IP");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // Rate limiting check
    const rateLimitKey = `rate_limit:${clientIP}`;
    const rateLimitData = await env.CACHE.get(rateLimitKey, { type: "json" });

    if (rateLimitData) {
      const now = Math.floor(Date.now() / 1000);
      if (now - rateLimitData.windowStart < RATE_LIMIT.window) {
        if (rateLimitData.count >= RATE_LIMIT.requests) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded" }),
            {
              status: 429,
              headers: {
                ...CORS_HEADERS,
                "Content-Type": "application/json",
                "Retry-After": String(RATE_LIMIT.window),
              },
            }
          );
        }
        rateLimitData.count++;
      } else {
        rateLimitData.windowStart = now;
        rateLimitData.count = 1;
      }
      await env.CACHE.put(rateLimitKey, JSON.stringify(rateLimitData), {
        expirationTtl: RATE_LIMIT.window,
      });
    } else {
      await env.CACHE.put(
        rateLimitKey,
        JSON.stringify({
          windowStart: Math.floor(Date.now() / 1000),
          count: 1,
        }),
        { expirationTtl: RATE_LIMIT.window }
      );
    }

    // Block suspicious requests
    const userAgent = request.headers.get("User-Agent") || "";
    const blockedBots = [
      "bot",
      "crawler",
      "spider",
      "scraper",
      "scanner",
    ];

    if (blockedBots.some((bot) => userAgent.toLowerCase().includes(bot))) {
      // Still allow if it has valid API key
      const apiKey = request.headers.get("X-API-Key");
      if (!apiKey) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    // Check cache for GET requests
    if (request.method === "GET") {
      const cacheKey = `cache:${url.pathname}:${url.search}`;
      const cached = await env.CACHE.get(cacheKey);

      if (cached) {
        return new Response(cached, {
          headers: {
            ...CORS_HEADERS,
            ...SECURITY_HEADERS,
            "Content-Type": "application/json",
            "X-Cache": "HIT",
          },
        });
      }
    }

    // Route to appropriate backend
    let response;

    // Static assets - serve from R2
    if (url.pathname.startsWith("/media/") || url.pathname.startsWith("/uploads/")) {
      const key = url.pathname.replace("/media/", "").replace("/uploads/", "");
      const object = await env.MEDIA_BUCKET.get(key);

      if (object === null) {
        return new Response("Not Found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000");

      return new Response(object.body, {
        headers: { ...headers, ...CORS_HEADERS },
      });
    }

    // API requests - proxy to backend
    if (url.pathname.startsWith("/api/")) {
      // Modify request to point to origin
      const originUrl = new URL(request.url);
      originUrl.hostname = "api.maiki.ai";

      const modifiedRequest = new Request(originUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      response = await fetch(modifiedRequest);

      // Cache successful GET responses
      if (request.method === "GET" && response.status === 200) {
        const clone = response.clone();
        const body = await clone.text();

        // Only cache for 5 minutes (300 seconds)
        await env.CACHE.put(`cache:${url.pathname}:${url.search}`, body, {
          expirationTtl: 300,
        });
      }
    } else {
      // Frontend - proxy to Next.js
      const originUrl = new URL(request.url);
      originUrl.hostname = "maiki.ai";

      response = await fetch(new Request(originUrl, request));
    }

    // Add headers to response
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      modifiedResponse.headers.set(key, value);
    });

    // Add CORS headers
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      modifiedResponse.headers.set(key, value);
    });

    return modifiedResponse;
  },

  // Scheduled task - runs every hour
  async scheduled(event, env, ctx) {
    // Clean up expired cache entries
    // This runs via the cron trigger

    // Log metrics
    await logMetrics(env);

    // Check service health
    await healthCheck(env);
  },
};

async function logMetrics(env) {
  // Collect metrics and send to analytics
  const metrics = {
    timestamp: new Date().toISOString(),
    requests: await env.CACHE.get("metrics:requests") || "0",
    errors: await env.CACHE.get("metrics:errors") || "0",
    cache_hits: await env.CACHE.get("metrics:cache_hits") || "0",
  };

  // Send to analytics (e.g., Datadog, Cloudflare Analytics)
  console.log("Metrics:", metrics);
}

async function healthCheck(env) {
  // Check backend health
  try {
    const response = await fetch("https://api.maiki.ai/health");
    if (!response.ok) {
      // Send alert
      console.error("Health check failed:", response.status);
    }
  } catch (e) {
    console.error("Health check error:", e);
  }
}
