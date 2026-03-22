"""AI Matching and Skills Assessment API routes."""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models import User, Job
from app.services.ai_matching_service import ai_matching_service

router = APIRouter(prefix="/ai-matching", tags=["ai-matching"])


# ============== Skills Assessment ==============

@router.get("/assessments/{skill_name}")
def get_skill_assessment(
    skill_name: str,
    assessment_type: str = Query("quiz", enum=["quiz", "practical", "portfolio"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate AI-powered skills assessment."""
    assessment = ai_matching_service.assess_skills(
        user_id=current_user.id,
        skill_name=skill_name,
        assessment_type=assessment_type,
        db=db,
    )

    if "error" in assessment:
        raise HTTPException(status_code=500, detail=assessment["error"])

    return assessment


@router.post("/assessments/{skill_name}/submit")
def submit_assessment(
    skill_name: str,
    answers: List[str],
    questions: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Submit assessment for evaluation."""
    result = ai_matching_service.evaluate_assessment(
        skill_name=skill_name,
        questions=questions,
        answers=answers,
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Update user's skills if passed
    if result.get("passed"):
        from app.models import Skill

        # Find or create skill
        skill = db.query(Skill).filter(Skill.name == skill_name).first()
        if not skill:
            skill = Skill(
                name=skill_name,
                slug=skill_name.lower().replace(" ", "-"),
                category="assessed",
            )
            db.add(skill)
            db.commit()

        # Add to user's skills
        if skill not in current_user.skills:
            current_user.skills.append(skill)
            db.commit()

    return result


# ============== Candidate Matching ==============

@router.get("/jobs/{job_id}/candidates")
def get_matching_candidates(
    job_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get AI-ranked candidates for a job (employer view)."""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check if user owns the job
    if job.client_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")

    matches = ai_matching_service.find_matching_candidates(db, job, limit=limit)

    return {
        "job_id": job_id,
        "job_title": job.title,
        "match_count": len(matches),
        "candidates": matches,
    }


@router.get("/candidates/match-score/{job_id}")
def get_my_match_score(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get my match score for a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    score = ai_matching_service.calculate_match_score(current_user, job)

    return {
        "job_id": job_id,
        "job_title": job.title,
        "match_score": score.overall_score,
        "breakdown": {
            "skill_match": score.skill_match,
            "experience_match": score.experience_match,
            "rate_match": score.rate_match,
            "availability_match": score.availability_match,
            "cultural_fit": score.cultural_fit,
        },
        "reasoning": score.reasoning,
        "recommendation": "Apply" if score.overall_score >= 70 else "Not recommended",
    }


# ============== Skill Gap Analysis ==============

@router.get("/skill-gaps/{target_role}")
def analyze_skill_gaps(
    target_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Analyze skill gaps for target role."""
    analysis = ai_matching_service.analyze_skill_gaps(current_user, target_role)

    if "error" in analysis:
        raise HTTPException(status_code=500, detail=analysis["error"])

    return analysis


@router.get("/recommended-skills")
def get_recommended_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get AI-recommended skills based on profile and market demand."""
    # In a real implementation, this would analyze market trends
    current_skills = [s.name for s in current_user.skills]

    # AI-powered recommendations
    prompt = f"""Based on this user profile, recommend skills to learn:

Current Skills: {', '.join(current_skills)}
Tier: {current_user.tier.value}
Experience: {current_user.hours_worked} hours

Recommend:
1. High-demand complementary skills
2. Skills to reach next tier
3. Emerging skills in VA industry
4. Time investment for each

Format as JSON:
{{
    "recommendations": [
        {{
            "skill": "...",
            "reason": "...",
            "demand": "high|medium|low",
            "time_to_learn_hours": 20,
            "resources": ["..."]
        }}
    ],
    "career_path": ["step 1", "step 2"]
}}"""

    from app.services.ai_matching_service import ai_matching_service as ai
    response = ai._call_llm(prompt)

    try:
        import json
        json_str = response[response.find("{"):response.rfind("}")+1]
        return json.loads(json_str)
    except:
        return {
            "recommendations": [
                {"skill": "Project Management", "reason": "High demand for VAs", "demand": "high"},
                {"skill": "Social Media Marketing", "reason": "Common VA task", "demand": "high"},
                {"skill": "Data Analysis", "reason": "Premium skill", "demand": "medium"},
            ]
        }


# ============== Proof-of-Work Badges ==============

@router.get("/badges")
def get_my_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get user's Proof-of-Work badges."""
    # Get stats
    hours_worked = float(current_user.hours_worked)
    rating = float(current_user.rating)
    reviews = current_user.total_reviews

    badges = []

    # Tier badges
    badges.append(ai_matching_service.generate_candidate_badge(
        current_user, f"{current_user.tier.value}_va"
    ))

    # Hours badges
    if hours_worked >= 1000:
        badges.append({
            "name": "1000 Hour Club",
            "tier": "platinum",
            "description": "Worked 1000+ hours on platform",
            "icon": "💎",
        })
    elif hours_worked >= 500:
        badges.append({
            "name": "500 Hour Veteran",
            "tier": "gold",
            "description": "Worked 500+ hours on platform",
            "icon": "🏆",
        })
    elif hours_worked >= 100:
        badges.append({
            "name": "100 Hour Rookie",
            "tier": "silver",
            "description": "Worked 100+ hours on platform",
            "icon": "⭐",
        })

    # Rating badges
    if rating >= 4.9:
        badges.append({
            "name": "Elite Rated",
            "tier": "diamond",
            "description": f"Maintained {rating:.1f}★ rating",
            "icon": "🌟",
        })
    elif rating >= 4.5:
        badges.append({
            "name": "Top Rated",
            "tier": "gold",
            "description": f"Maintained {rating:.1f}★ rating",
            "icon": "⭐",
        })

    # Review badges
    if reviews >= 50:
        badges.append({
            "name": "Client Favorite",
            "tier": "gold",
            "description": "Received 50+ reviews",
            "icon": "❤️",
        })

    return {
        "user_id": current_user.id,
        "total_badges": len(badges),
        "badges": badges,
        "stats": {
            "hours_worked": hours_worked,
            "rating": rating,
            "reviews": reviews,
        },
    }


@router.get("/candidates/discover")
def discover_candidates(
    skills: Optional[str] = None,
    min_tier: str = Query("apprentice", enum=["apprentice", "associate", "professional", "expert", "master", "legend"]),
    min_rating: float = Query(4.0, ge=1.0, le=5.0),
    available_now: bool = False,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Discover qualified candidates (employer-first marketplace)."""
    from app.models import UserTier

    query = db.query(User).filter(
        User.role.in_(["va", "both"]),
        User.is_active == True,
        User.is_verified == True,
        User.rating >= min_rating,
    )

    # Filter by tier
    tier_order = ["apprentice", "associate", "professional", "expert", "master", "legend"]
    min_index = tier_order.index(min_tier)
    allowed_tiers = tier_order[min_index:]
    query = query.filter(User.tier.in_([UserTier[t.upper()] for t in allowed_tiers]))

    # Filter by skills
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        query = query.join(User.skills).filter(
            Skill.name.ilike(f"%{skill_list[0]}%")
        )

    candidates = query.order_by(User.rating.desc()).limit(limit).all()

    return [
        {
            "id": c.id,
            "name": c.full_name,
            "title": c.bio[:100] if c.bio else f"{c.tier.value.title()} Virtual Assistant",
            "avatar": c.avatar_url,
            "tier": c.tier.value,
            "rating": float(c.rating),
            "reviews": c.total_reviews,
            "hourly_rate": float(c.hourly_rate_min) if c.hourly_rate_min else None,
            "skills": [s.name for s in c.skills[:5]],
            "hours_worked": float(c.hours_worked),
            "availability": "available",  # Would check calendar
        }
        for c in candidates
    ]


# ============== Auto-Matching Webhook ==============

@router.post("/webhooks/job-posted")
def auto_match_on_job_post(
    job_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """Automatically match candidates when job is posted."""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = ai_matching_service.auto_match_job_to_candidates(db, job)

    # Here you would trigger notifications to matched candidates
    # via email, push notification, etc.

    return result
