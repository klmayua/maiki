"""Pydantic schemas for scraped job API."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

from app.models.scraped_job import ScrapedJobSource, AutoApplyStatus


class ScrapedJobBase(BaseModel):
    """Base scraped job schema."""
    title: str
    description: str
    company: Optional[str] = None
    location: Optional[str] = "Remote"
    job_type: str = "contract"
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    currency: str = "USD"
    skills_required: List[str] = []
    experience_level: str = "any"
    remote_ok: bool = True
    timezone: Optional[str] = None


class ScrapedJobCreate(ScrapedJobBase):
    """Schema for creating a scraped job."""
    source: ScrapedJobSource
    external_id: str
    url: str
    posted_at: Optional[datetime] = None
    raw_data: Dict[str, Any] = {}


class ScrapedJobResponse(ScrapedJobBase):
    """Schema for scraped job response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    source: ScrapedJobSource
    external_id: str
    url: str
    is_active: bool
    posted_at: Optional[datetime]
    last_scraped_at: datetime
    auto_apply_supported: bool
    auto_apply_status: Optional[AutoApplyStatus] = None
    ai_summary: Optional[str] = None
    match_score: Optional[float] = None
    is_saved: Optional[bool] = False
    blockchain_verified: Optional[bool] = False


class ScrapedJobListParams(BaseModel):
    """Query parameters for listing scraped jobs."""
    source: Optional[ScrapedJobSource] = None
    search: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    experience_level: Optional[str] = None
    remote_only: bool = True
    days_since_posted: int = 7
    skills: Optional[str] = None
    skip: int = 0
    limit: int = 20


class ScrapedJobMatchCreate(BaseModel):
    """Schema for creating a job match."""
    scraped_job_id: int
    match_score: float


class ScrapedJobMatchResponse(BaseModel):
    """Schema for job match response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    scraped_job_id: int
    user_id: int
    match_score: float
    skill_match_percent: Optional[float]
    reason: Optional[str]
    is_viewed: bool
    is_applied: bool
    is_saved: bool
    created_at: datetime
    viewed_at: Optional[datetime]
    applied_at: Optional[datetime]


class JobScrapeLogResponse(BaseModel):
    """Schema for scrape log response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    source: ScrapedJobSource
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    jobs_found: int
    jobs_new: int
    jobs_updated: int
    jobs_duplicate: int
    jobs_failed: int
    status: str
    error_message: Optional[str]


class ScrapingStats(BaseModel):
    """Schema for scraping statistics."""
    total_active_jobs: int
    recent_jobs_7d: int
    by_source: Dict[str, int]
    avg_budget: Dict[str, Optional[float]]


class ManualScrapeTrigger(BaseModel):
    """Schema for triggering manual scrape."""
    source: Optional[str] = None


class ManualScrapeResponse(BaseModel):
    """Schema for manual scrape response."""
    message: str
    task_id: str
    source: Optional[str] = None
    sources: Optional[List[str]] = None
