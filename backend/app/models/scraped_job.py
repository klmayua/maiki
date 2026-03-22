"""Scraped job models for external job board aggregation."""
import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey,
    Text, Enum, JSON, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from sqlalchemy.orm import Mapped


class ScrapedJobSource(str, enum.Enum):
    """Sources for scraped jobs."""
    UPWORK = "upwork"
    LINKEDIN = "linkedin"
    INDEED = "indeed"
    WE_WORK_REMOTELY = "we_work_remotely"
    REMOTIVE = "remotive"
    FLEXJOBS = "flexjobs"
    OTHER = "other"


class AutoApplyStatus(str, enum.Enum):
    """Auto-apply status for scraped jobs."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    NOT_SUPPORTED = "not_supported"


class ScrapedJob(Base):
    """Job scraped from external sources."""
    __tablename__ = "scraped_jobs"

    id = Column(Integer, primary_key=True, index=True)

    # Source tracking
    source = Column(Enum(ScrapedJobSource), nullable=False, index=True)
    external_id = Column(String(255), nullable=False, index=True)
    url = Column(String(1000), nullable=False)

    # Job details
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    company = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    job_type = Column(String(50), default="contract")  # full_time, part_time, contract, project

    # Budget
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    currency = Column(String(3), default="USD")

    # Requirements
    skills_required = Column(JSON, default=list)
    experience_level = Column(String(50), default="any")  # entry, intermediate, expert
    language_requirements = Column(JSON, default=list)
    timezone = Column(String(100), nullable=True)

    # Status
    is_active = Column(Boolean, default=True, index=True)
    remote_ok = Column(Boolean, default=True)
    posted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Auto-apply
    auto_apply_supported = Column(Boolean, default=False)
    auto_apply_status = Column(Enum(AutoApplyStatus), nullable=True)
    auto_applied_at = Column(DateTime, nullable=True)
    auto_applied_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    auto_apply_error = Column(Text, nullable=True)

    # Scraping metadata
    last_scraped_at = Column(DateTime, default=func.now())
    scrape_count = Column(Integer, default=1)
    raw_data = Column(JSON, default=dict)

    # AI matching
    match_score = Column(Float, nullable=True)  # Temporary field for matching
    ai_summary = Column(Text, nullable=True)  # AI-generated summary

    # Relationships
    auto_applied_user = relationship("User", backref="auto_applied_jobs")

    # Unique constraint on source + external_id
    __table_args__ = (
        Index("idx_scraped_job_source_external", "source", "external_id", unique=True),
        Index("idx_scraped_job_active", "is_active", "source"),
        Index("idx_scraped_job_posted", "posted_at"),
    )

    def __repr__(self):
        return f"<ScrapedJob {self.title} from {self.source}>"


class ScrapedJobMatch(Base):
    """Matches between scraped jobs and users."""
    __tablename__ = "scraped_job_matches"

    id = Column(Integer, primary_key=True, index=True)
    scraped_job_id = Column(Integer, ForeignKey("scraped_jobs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Match details
    match_score = Column(Float, nullable=False)
    skill_match_percent = Column(Float, nullable=True)
    reason = Column(Text, nullable=True)  # Why this is a match

    # Status
    is_viewed = Column(Boolean, default=False)
    is_applied = Column(Boolean, default=False)
    is_saved = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    viewed_at = Column(DateTime, nullable=True)
    applied_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_scraped_match_user", "user_id", "is_viewed"),
        Index("idx_scraped_match_score", "scraped_job_id", "match_score"),
    )


class JobScrapeLog(Base):
    """Log of scraping operations."""
    __tablename__ = "job_scrape_logs"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(Enum(ScrapedJobSource), nullable=False)

    # Scrape stats
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    jobs_found = Column(Integer, default=0)
    jobs_new = Column(Integer, default=0)
    jobs_updated = Column(Integer, default=0)
    jobs_duplicate = Column(Integer, default=0)
    jobs_failed = Column(Integer, default=0)

    # Error tracking
    status = Column(String(50), default="running")  # running, success, partial, failed
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, default=dict)

    # Metadata
    scraper_version = Column(String(50), default="1.0")
    proxy_used = Column(String(255), nullable=True)
    ip_address = Column(String(100), nullable=True)

    __table_args__ = (
        Index("idx_scrape_log_source", "source", "started_at"),
        Index("idx_scrape_log_status", "status", "completed_at"),
    )
