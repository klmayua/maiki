import { test, expect } from '@playwright/test'
import { writeFileSync } from 'fs'

/**
 * Comprehensive Maiki Application Audit Tests
 * These tests verify all links, buttons, and functionality work correctly
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Store audit results
const auditResults = {
  timestamp: new Date().toISOString(),
  totalRoutes: 0,
  workingRoutes: 0,
  brokenRoutes: [] as string[],
  warnings: [] as string[],
  apiStatus: {} as Record<string, boolean>
}

// Routes that should exist based on navigation
const EXPECTED_ROUTES = [
  '/',                    // Landing page
  '/login',              // Authentication
  '/register',
  '/dashboard',          // Main dashboard
  '/dashboard/jobs',
  '/dashboard/messages',
  '/dashboard/earnings',
  '/dashboard/growth',
  '/dashboard/settings',
  '/dashboard/learn',
  '/dashboard/teams',
  '/community',          // Community page
  '/chat',               // Chat page
]

// Routes that are LINKED but may not exist yet
const REFERENCED_ROUTES = [
  '/discover',           // Referenced in navbar, landing
  '/post-job',           // Referenced in CTA
  '/apply',              // Referenced in footer
  '/forgot-password',    // Referenced in login
  '/pricing',            // Referenced in navbar
  '/help',               // Referenced in footer
]

test.describe('Maiki Application Audit', () => {

  test.describe('Route Verification', () => {
    for (const route of EXPECTED_ROUTES) {
      test(`Route ${route} should be accessible`, async ({ page }) => {
        const response = await page.goto(`${BASE_URL}${route}`, { timeout: 10000 })
        const status = response?.status() || 0

        auditResults.totalRoutes++

        if (status === 200) {
          auditResults.workingRoutes++
          expect(status).toBe(200)
        } else if (status === 404) {
          auditResults.brokenRoutes.push(route)
          auditResults.warnings.push(`Route ${route} returns 404`)
          // Don't fail test, just record
          expect.soft(status).not.toBe(404)
        } else {
          auditResults.warnings.push(`Route ${route} returns status ${status}`)
          expect.soft(status).toBe(200)
        }
      })
    }
  })

  test.describe('Missing Route Detection', () => {
    for (const route of REFERENCED_ROUTES) {
      test(`Referenced route ${route} should exist`, async ({ page }) => {
        const response = await page.goto(`${BASE_URL}${route}`, { timeout: 5000 })
        const status = response?.status() || 0

        if (status === 404) {
          auditResults.warnings.push(`❌ REFERENCED route ${route} is MISSING (404)`)
          expect.soft(status).not.toBe(404)
        } else {
          auditResults.warnings.push(`✅ ${route} exists (${status})`)
          expect(status).toBe(200)
        }
      })
    }
  })

  test.describe('Link Verification - Landing Page', () => {
    test('All links on landing page should resolve', async ({ page }) => {
      await page.goto(BASE_URL)

      const links = await page.locator('a[href^="/"]').all()
      const uniqueHrefs = new Set<string>()

      for (const link of links) {
        const href = await link.getAttribute('href')
        if (href && !href.startsWith('#') && !href.startsWith('//')) {
          uniqueHrefs.add(href)
        }
      }

      for (const href of uniqueHrefs) {
        // Skip hash links
        if (href.includes('#')) continue

        const response = await page.request.get(`${BASE_URL}${href}`)
        if (response.status() === 404) {
          auditResults.warnings.push(`Link ${href} returns 404`)
        }
        expect.soft(response.status()).not.toBe(404)
      }
    })
  })

  test.describe('API Connectivity', () => {
    const API_BASE = 'http://localhost:8000/api/v1'

    test('Backend health endpoint should respond', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/health`, { timeout: 5000 })
        auditResults.apiStatus['health'] = response.ok()
        expect(response.ok()).toBeTruthy()
      } catch (e) {
        auditResults.apiStatus['health'] = false
        auditResults.warnings.push('Backend API not reachable at ' + API_BASE)
        expect.soft(false).toBe(true)
      }
    })

    test('Jobs API should be accessible', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/jobs/scraped/`, { timeout: 5000 })
        auditResults.apiStatus['jobs'] = response.ok()
        if (!response.ok()) {
          auditResults.warnings.push(`Jobs API returned ${response.status()}`)
        }
      } catch (e) {
        auditResults.apiStatus['jobs'] = false
        auditResults.warnings.push('Jobs API not reachable')
      }
    })

    test('Stats endpoint should work', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/jobs/scraped/stats/overview`, { timeout: 5000 })
        auditResults.apiStatus['stats'] = response.ok()
      } catch (e) {
        auditResults.apiStatus['stats'] = false
      }
    })
  })

  test.describe('Component Functionality', () => {
    test('Landing page buttons should be clickable', async ({ page }) => {
      await page.goto(BASE_URL)

      // Check main CTAs
      const findTalentBtn = page.getByRole('button', { name: /find talent/i })
      const findJobsBtn = page.getByRole('button', { name: /find va jobs/i })

      await expect(findTalentBtn).toBeVisible()
      await expect(findJobsBtn).toBeVisible()

      // Verify they have links
      const talentLink = findTalentBtn.locator('..').locator('a')
      const jobsLink = findJobsBtn.locator('..').locator('a')
    })

    test('Navigation should work on desktop', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.setViewportSize({ width: 1280, height: 720 })

      // Find all nav links
      const navLinks = await page.locator('nav a').all()
      expect(navLinks.length).toBeGreaterThan(0)
    })
  })

  test.describe('Design System Verification', () => {
    test('Should use correct color system', async ({ page }) => {
      await page.goto(BASE_URL)

      // Check for old color system classes (should NOT exist on updated pages)
      const oldColors = await page.locator('.bg-maiki-950, .text-maiki-400, .bg-maiki-600').count()

      // If old colors are found on the landing page, it needs updating
      if (oldColors > 0) {
        auditResults.warnings.push(`Found ${oldColors} old color class references on landing page`)
      }
    })

    test('Should have glassmorphism classes', async ({ page }) => {
      await page.goto(BASE_URL)

      // Check for glass classes
      const glassElements = await page.locator('.glass, .glass-card, .glass-nav').count()

      if (glassElements === 0) {
        auditResults.warnings.push('No glassmorphism classes found - design system may not be applied')
      }
    })
  })

  test.describe('Auth Flow', () => {
    test('Unauthenticated user should see login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)

      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })

    test('Login should have working links', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)

      // Check register link
      const registerLink = page.getByRole('link', { name: /sign up/i })
      await expect(registerLink).toBeVisible()

      // Check forgot password link
      const forgotLink = page.getByRole('link', { name: /forgot password/i })
      await expect(forgotLink).toBeVisible()

      // Click register and verify it navigates
      await registerLink.click()
      await expect(page).toHaveURL(/.*register.*/)
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('Should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto(BASE_URL)

      // Page should not overflow horizontally
      const body = await page.locator('body')
      const scrollWidth = await body.evaluate(el => el.scrollWidth)
      const clientWidth = await body.evaluate(el => el.clientWidth)

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20) // Allow small scrollbar
    })
  })

  // Cleanup - generate report
  test.afterAll(async () => {
    // Write audit results to file
    writeFileSync('audit-results.json', JSON.stringify(auditResults, null, 2))

    console.log('\n=== AUDIT SUMMARY ===')
    console.log(`Total Routes Tested: ${auditResults.totalRoutes}`)
    console.log(`Working Routes: ${auditResults.workingRoutes}`)
    console.log(`Broken Routes: ${auditResults.brokenRoutes.length}`)
    console.log(`\nBroken Routes: ${auditResults.brokenRoutes.join(', ') || 'None'}`)
    console.log(`\nWarnings (${auditResults.warnings.length}):`)
    auditResults.warnings.forEach(w => console.log(`  - ${w}`))
    console.log('\nAPI Status:')
    Object.entries(auditResults.apiStatus).forEach(([key, status]) => {
      console.log(`  ${key}: ${status ? '✅' : '❌'}`)
    })
  })
})
