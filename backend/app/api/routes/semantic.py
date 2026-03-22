"""Vector database API routes for semantic search."""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models import User, Job
from app.services.vector_db_service import vector_db_service

router = APIRouter(prefix="/semantic", tags=["semantic-search"])


@router.post("/index/user/{user_id}")
def index_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Index a user profile for semantic search."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    success = vector_db_service.index_user(user)

    return {
        "user_id": user_id,
        "indexed": success,
        "message": "User indexed successfully" if success else "Indexing failed",
    }


@router.post("/index/job/{job_id}")
def index_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Index a job for semantic search."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    success = vector_db_service.index_job(job)

    return {
        "job_id": job_id,
        "indexed": success,
        "message": "Job indexed successfully" if success else "Indexing failed",
    }


@router.get("/search/users")
def search_users(
    query: str = Query(..., min_length=3),
    top_k: int = Query(10, ge=1, le=100),
    tier: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None, ge=1, le=5),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Search users by semantic similarity."""
    filters = {}
    if tier:
        filters["tier"] = tier
    if min_rating:
        filters["rating"] = {"$gte": min_rating}

    results = vector_db_service.semantic_search_users(query, top_k, filters)

    return {
        "query": query,
        "results_count": len(results),
        "results": [
            {
                "user_id": r.metadata.get("user_id"),
                "name": r.metadata.get("name"),
                "score": r.score,
                "tier": r.metadata.get("tier"),
                "rating": r.metadata.get("rating"),
                "skills": r.metadata.get("skills", []),
                "hourly_rate": r.metadata.get("hourly_rate_min"),
            }
            for r in results
        ],
    }


@router.get("/search/jobs")
def search_jobs(
    query: str = Query(..., min_length=3),
    top_k: int = Query(10, ge=1, le=100),
    experience_level: Optional[str] = Query(None),
    min_budget: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Search jobs by semantic similarity."""
    filters = {}
    if experience_level:
        filters["experience_level"] = experience_level
    if min_budget:
        filters["budget_max"] = {"$gte": min_budget}

    results = vector_db_service.semantic_search_jobs(query, top_k, filters)

    return {
        "query": query,
        "results_count": len(results),
        "results": [
            {
                "job_id": r.metadata.get("job_id"),
                "title": r.metadata.get("title"),
                "score": r.score,
                "skills": r.metadata.get("skills", []),
                "experience_level": r.metadata.get("experience_level"),
                "budget_min": r.metadata.get("budget_min"),
                "budget_max": r.metadata.get("budget_max"),
            }
            for r in results
        ],
    }


@router.post("/reindex/all")
def reindex_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Reindex all users and jobs (admin only)."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin only")

    # Get all users
    users = db.query(User).filter(User.is_active == True).all()
    user_results = {"success": 0, "failed": 0}

    for user in users:
        if vector_db_service.index_user(user):
            user_results["success"] += 1
        else:
            user_results["failed"] += 1

    # Get all open jobs
    jobs = db.query(Job).filter(Job.status == "open").all()
    job_results = {"success": 0, "failed": 0}

    for job in jobs:
        if vector_db_service.index_job(job):
            job_results["success"] += 1
        else:
            job_results["failed"] += 1

    return {
        "message": "Reindexing complete",
        "users": user_results,
        "jobs": job_results,
    }
