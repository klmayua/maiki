import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  contract_id?: number;
  rating: number;
  title?: string;
  content: string;
  communication?: number;
  quality?: number;
  timeliness?: number;
  created_at: string;
  reviewer?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface ReviewStats {
  user_id: number;
  total_reviews: number;
  average_rating: number;
  average_communication: number;
  average_quality: number;
  average_timeliness: number;
  rating_distribution: {
    [key: number]: number;
  };
}

export function useReviews(userId?: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        api.get("/reviews", { params: { user_id: userId } }),
        api.get(`/reviews/stats/${userId}`),
      ]);

      setReviews(reviewsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const createReview = async (data: {
    reviewee_id: number;
    contract_id?: number;
    rating: number;
    title?: string;
    content: string;
    communication?: number;
    quality?: number;
    timeliness?: number;
  }) => {
    const response = await api.post("/reviews", data);
    setReviews((prev) => [response.data, ...prev]);
    return response.data;
  };

  const updateReview = async (
    reviewId: number,
    data: Partial<Review>
  ) => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? response.data : review))
    );
    return response.data;
  };

  const deleteReview = async (reviewId: number) => {
    await api.delete(`/reviews/${reviewId}`);
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  };

  return {
    reviews,
    stats,
    loading,
    error,
    refetch: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
  };
}

export function useCurrentUserReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/reviews", {
        params: { reviewer_id: "me" },
      });
      setReviews(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
}
