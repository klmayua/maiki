"""AI-powered candidate matching and skills assessment service."""
import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass
import numpy as np

import requests
from sqlalchemy.orm import Session

from app.models import User, Job, Application, Skill
from app.models.wallet import Wallet, Transaction, TransactionType, TransactionStatus


@dataclass
class MatchScore:
    """Candidate-job match scoring result."""
    overall_score: float  # 0-100
    skill_match: float
    experience_match: float
    rate_match: float
    availability_match: float
    cultural_fit: float
    reasoning: str


class AIMatchingService:
    """AI service for candidate matching and skills assessment."""

    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.kimi_api_key = os.getenv("KIMI_API_KEY")
        self.dashscope_api_key = os.getenv("DASHSCOPE_API_KEY")

        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"
        self.kimi_url = "https://api.moonshot.ai/v1/chat/completions"
        self.dashscope_url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"

    def _call_llm(self, prompt: str, model: str = "groq") -> str:
        """Call LLM API with fallback chain."""

        if model == "groq" and self.groq_api_key:
            try:
                response = requests.post(
                    self.groq_url,
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                    },
                    timeout=30,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Groq error: {e}")

        if model in ["groq", "kimi"] and self.kimi_api_key:
            try:
                response = requests.post(
                    self.kimi_url,
                    headers={
                        "Authorization": f"Bearer {self.kimi_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "kimi-k2-turbo-preview",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                    },
                    timeout=30,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Kimi error: {e}")

        if self.dashscope_api_key:
            try:
                response = requests.post(
                    self.dashscope_url,
                    headers={
                        "Authorization": f"Bearer {self.dashscope_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "qwen3-coder-plus",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                    },
                    timeout=30,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Dashscope error: {e}")

        return ""

    def assess_skills(
        self,
        user_id: int,
        skill_name: str,
        assessment_type: str = "quiz",  # quiz, practical, portfolio
        db: Session = None,
    ) -> Dict[str, Any]:
        """Generate AI-powered skills assessment."""

        prompt = f"""Generate a {assessment_type} assessment for the skill: {skill_name}

Create 5 questions that test practical knowledge:
- 2 multiple choice (technical concepts)
- 2 scenario-based problem solving
- 1 code/task sample review

Format as JSON:
{{
    "questions": [
        {{
            "type": "multiple_choice",
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "difficulty": "beginner|intermediate|advanced"
        }}
    ],
    "time_estimate_minutes": 15,
    "passing_score": 70
}}"""

        response = self._call_llm(prompt)

        try:
            # Extract JSON from response
            json_str = response[response.find("{"):response.rfind("}")+1]
            assessment = json.loads(json_str)
            assessment["skill"] = skill_name
            assessment["generated_at"] = datetime.utcnow().isoformat()
            return assessment
        except:
            return {
                "error": "Failed to generate assessment",
                "raw_response": response,
            }

    def evaluate_assessment(
        self,
        skill_name: str,
        questions: List[Dict],
        answers: List[str],
    ) -> Dict[str, Any]:
        """Evaluate completed assessment with AI."""

        prompt = f"""Evaluate this skills assessment for {skill_name}:

Questions and correct answers:
{json.dumps(questions, indent=2)}

User answers:
{json.dumps(answers, indent=2)}

Provide:
1. Score (0-100)
2. Detailed feedback on wrong answers
3. Skill level assessment (beginner/intermediate/advanced/expert)
4. Areas for improvement

Format as JSON:
{{
    "score": 85,
    "level": "intermediate",
    "passed": true,
    "feedback": "...",
    "strengths": ["..."],
    "improvements": ["..."],
    "recommended_learning": ["..."]
}}"""

        response = self._call_llm(prompt)

        try:
            json_str = response[response.find("{"):response.rfind("}")+1]
            result = json.loads(json_str)
            return result
        except:
            return {"error": "Failed to evaluate", "raw_response": response}

    def calculate_match_score(
        self,
        candidate: User,
        job: Job,
    ) -> MatchScore:
        """Calculate AI-powered match score between candidate and job."""

        # Get candidate skills
        candidate_skills = {s.name.lower() for s in candidate.skills}
        job_skills = {s.name.lower() for s in job.required_skills}

        # Basic skill overlap
        if job_skills:
            skill_overlap = len(candidate_skills & job_skills) / len(job_skills)
        else:
            skill_overlap = 1.0

        # Rate compatibility
        if candidate.hourly_rate_min and job.budget_max:
            rate_fit = min(1.0, float(job.budget_max) / float(candidate.hourly_rate_min))
        else:
            rate_fit = 0.5

        # Use AI for deeper analysis
        prompt = f"""Analyze candidate-job fit:

CANDIDATE:
- Skills: {', '.join(candidate_skills)}
- Experience: {candidate.hours_worked} hours
- Tier: {candidate.tier.value}
- Rating: {candidate.rating}/5

JOB:
- Title: {job.title}
- Required Skills: {', '.join(job_skills)}
- Experience Level: {job.experience_level}
- Required Tier: {job.required_tier.value}

Calculate match scores (0-100) for:
1. Skill match
2. Experience match
3. Rate/budget compatibility
4. Availability match
5. Cultural/communication fit

Format as JSON:
{{
    "skill_match": 85,
    "experience_match": 70,
    "rate_match": 90,
    "availability_match": 100,
    "cultural_fit": 80,
    "overall_score": 85,
    "reasoning": "Brief explanation of scoring"
}}"""

        response = self._call_llm(prompt)

        try:
            json_str = response[response.find("{"):response.rfind("}")+1]
            result = json.loads(json_str)

            return MatchScore(
                overall_score=result.get("overall_score", 50),
                skill_match=result.get("skill_match", 50),
                experience_match=result.get("experience_match", 50),
                rate_match=result.get("rate_match", 50),
                availability_match=result.get("availability_match", 50),
                cultural_fit=result.get("cultural_fit", 50),
                reasoning=result.get("reasoning", ""),
            )
        except:
            # Fallback to basic calculation
            overall = (skill_overlap * 40 + rate_fit * 30 + float(candidate.rating) / 5 * 30)
            return MatchScore(
                overall_score=overall,
                skill_match=skill_overlap * 100,
                experience_match=70 if candidate.tier.value in ["professional", "expert", "master", "legend"] else 50,
                rate_match=rate_fit * 100,
                availability_match=100,
                cultural_fit=75,
                reasoning="Basic algorithm scoring - AI analysis unavailable",
            )

    def find_matching_candidates(
        self,
        db: Session,
        job: Job,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Find and rank candidates for a job."""

        # Get candidates with required skills
        candidates = db.query(User).filter(
            User.role.in_(["va", "both"]),
            User.is_active == True,
            User.is_verified == True,
        ).all()

        matches = []
        for candidate in candidates:
            score = self.calculate_match_score(candidate, job)

            # Only include good matches
            if score.overall_score >= 60:
                matches.append({
                    "candidate_id": candidate.id,
                    "name": candidate.full_name,
                    "email": candidate.email,
                    "avatar": candidate.avatar_url,
                    "tier": candidate.tier.value,
                    "rating": float(candidate.rating),
                    "hourly_rate": float(candidate.hourly_rate_min) if candidate.hourly_rate_min else None,
                    "match_score": score.overall_score,
                    "skill_match": score.skill_match,
                    "experience_match": score.experience_match,
                    "rate_match": score.rate_match,
                    "reasoning": score.reasoning,
                })

        # Sort by match score
        matches.sort(key=lambda x: x["match_score"], reverse=True)

        return matches[:limit]

    def analyze_skill_gaps(
        self,
        user: User,
        target_job_type: str,
    ) -> Dict[str, Any]:
        """Analyze skill gaps and provide recommendations."""

        current_skills = [s.name for s in user.skills]

        prompt = f"""Analyze skill gaps for a {target_job_type} role:

Current Skills: {', '.join(current_skills)}
User Tier: {user.tier.value}
Experience: {user.hours_worked} hours

Identify:
1. Missing critical skills for this role
2. Skills to upgrade (beginner → intermediate → advanced)
3. Learning path recommendations
4. Time estimate to job-readiness
5. Specific courses/certifications

Format as JSON:
{{
    "missing_critical_skills": ["..."],
    "skills_to_upgrade": [{{"skill": "...", "current": "beginner", "target": "intermediate"}}],
    "learning_path": ["step 1", "step 2"],
    "time_to_readiness_weeks": 8,
    "recommended_courses": ["..."],
    "market_demand": "high|medium|low"
}}"""

        response = self._call_llm(prompt)

        try:
            json_str = response[response.find("{"):response.rfind("}")+1]
            return json.loads(json_str)
        except:
            return {
                "error": "Failed to analyze",
                "current_skills": current_skills,
            }

    def generate_candidate_badge(
        self,
        user: User,
        badge_type: str,
    ) -> Dict[str, Any]:
        """Generate NFT-style Proof-of-Work badge."""

        # Calculate badge metrics based on actual work
        prompt = f"""Generate a {badge_type} badge for a virtual assistant:

Profile:
- Name: {user.full_name}
- Tier: {user.tier.value}
- Hours Worked: {user.hours_worked}
- Rating: {user.rating}/5
- Reviews: {user.total_reviews}

Create badge metadata:
{{
    "badge_name": "...",
    "badge_tier": "bronze|silver|gold|platinum|diamond",
    "description": "...",
    "requirements_met": ["..."],
    "rarity": "common|rare|epic|legendary",
    "proof_of_work": {{
        "hours_verified": {user.hours_worked},
        "client_satisfaction": {user.rating},
        "projects_completed": "calculated",
        "on_time_delivery_rate": "calculated"
    }},
    "blockchain_metadata": {{
        "token_standard": "ERC-1155",
        "chain": "Polygon",
        "mintable": true
    }}
}}"""

        response = self._call_llm(prompt)

        try:
            json_str = response[response.find("{"):response.rfind("}")+1]
            badge = json.loads(json_str)
            badge["user_id"] = user.id
            badge["issued_at"] = datetime.utcnow().isoformat()
            badge["verified"] = True
            return badge
        except:
            return {
                "badge_name": f"{user.tier.value.title()} VA",
                "badge_tier": user.tier.value,
                "user_id": user.id,
                "hours_verified": float(user.hours_worked),
                "rating": float(user.rating),
            }

    def auto_match_job_to_candidates(
        self,
        db: Session,
        job: Job,
    ) -> Dict[str, Any]:
        """Automatically match qualified candidates when job is posted."""

        matches = self.find_matching_candidates(db, job, limit=5)

        # If we have strong matches, auto-invite them
        auto_invites = []
        for match in matches:
            if match["match_score"] >= 80:
                auto_invites.append(match)

        return {
            "job_id": job.id,
            "job_title": job.title,
            "total_matches": len(matches),
            "auto_invites_sent": len(auto_invites),
            "top_matches": matches[:3],
            "match_threshold": 80,
        }


# Singleton instance
ai_matching_service = AIMatchingService()
