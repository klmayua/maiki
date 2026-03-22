"""Vector database service for semantic matching."""
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

import numpy as np
from sqlalchemy.orm import Session

# Try to import vector DB clients
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

try:
    import pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False

from app.models import User, Job, Skill


@dataclass
class EmbeddingResult:
    """Result from embedding search."""
    id: str
    score: float
    metadata: Dict[str, Any]


class VectorDBService:
    """Service for semantic search using embeddings."""

    def __init__(self):
        self.use_chroma = os.getenv("USE_CHROMADB", "true").lower() == "true"
        self.use_pinecone = os.getenv("USE_PINECONE", "false").lower() == "true"
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

        self.client = None
        self.index = None

        if self.use_chroma and CHROMADB_AVAILABLE:
            self._init_chromadb()
        elif self.use_pinecone and PINECONE_AVAILABLE:
            self._init_pinecone()

    def _init_chromadb(self):
        """Initialize ChromaDB."""
        persist_directory = os.getenv("CHROMADB_PATH", "./chroma_db")
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=persist_directory,
        ))

        # Create collections
        self.user_collection = self.client.get_or_create_collection("users")
        self.job_collection = self.client.get_or_create_collection("jobs")

    def _init_pinecone(self):
        """Initialize Pinecone."""
        pinecone.init(
            api_key=os.getenv("PINECONE_API_KEY"),
            environment=os.getenv("PINECONE_ENVIRONMENT", "us-west1-gcp"),
        )

        # Get or create indexes
        index_name = "maiki-users"
        if index_name not in pinecone.list_indexes():
            pinecone.create_index(index_name, dimension=1536)  # OpenAI embedding size
        self.user_index = pinecone.Index(index_name)

        index_name = "maiki-jobs"
        if index_name not in pinecone.list_indexes():
            pinecone.create_index(index_name, dimension=1536)
        self.job_index = pinecone.Index(index_name)

    def _get_embedding(self, text: str) -> List[float]:
        """Get embedding for text using OpenAI API."""
        if not self.openai_api_key:
            # Return random embedding for testing
            return np.random.randn(1536).tolist()

        import openai
        openai.api_key = self.openai_api_key

        response = openai.Embedding.create(
            input=text,
            model="text-embedding-ada-002"
        )
        return response["data"][0]["embedding"]

    def embed_user(self, user: User) -> Dict[str, Any]:
        """Create embedding for a user profile."""
        skills_text = ", ".join([s.name for s in user.skills])

        profile_text = f"""
        Virtual Assistant Profile:
        Name: {user.first_name} {user.last_name}
        Tier: {user.tier.value if hasattr(user.tier, 'value') else user.tier}
        Bio: {user.bio or 'No bio'}
        Skills: {skills_text}
        Experience: {user.hours_worked} hours
        Rating: {user.rating}/5
        Rate: ${user.hourly_rate_min or 'Not set'} - ${user.hourly_rate_max or 'Not set'}
        """

        embedding = self._get_embedding(profile_text)

        return {
            "id": f"user_{user.id}",
            "embedding": embedding,
            "metadata": {
                "user_id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "tier": user.tier.value if hasattr(user.tier, 'value') else user.tier,
                "skills": [s.name for s in user.skills],
                "rating": float(user.rating),
                "hourly_rate_min": float(user.hourly_rate_min) if user.hourly_rate_min else None,
            },
        }

    def embed_job(self, job: Job) -> Dict[str, Any]:
        """Create embedding for a job posting."""
        skills_text = ", ".join([s.name for s in job.required_skills])

        job_text = f"""
        Job Posting:
        Title: {job.title}
        Description: {job.description}
        Required Skills: {skills_text}
        Experience Level: {job.experience_level}
        Budget: ${job.budget_min} - ${job.budget_max}
        Job Type: {job.job_type}
        """

        embedding = self._get_embedding(job_text)

        return {
            "id": f"job_{job.id}",
            "embedding": embedding,
            "metadata": {
                "job_id": job.id,
                "title": job.title,
                "skills": [s.name for s in job.required_skills],
                "experience_level": job.experience_level,
                "budget_min": float(job.budget_min) if job.budget_min else None,
                "budget_max": float(job.budget_max) if job.budget_max else None,
            },
        }

    def index_user(self, user: User) -> bool:
        """Add or update user in vector DB."""
        if not self.client and not self.index:
            return False

        data = self.embed_user(user)

        if self.use_chroma and CHROMADB_AVAILABLE:
            self.user_collection.add(
                ids=[data["id"]],
                embeddings=[data["embedding"]],
                metadatas=[data["metadata"]],
            )
            return True

        elif self.use_pinecone and PINECONE_AVAILABLE:
            self.user_index.upsert([
                (data["id"], data["embedding"], data["metadata"])
            ])
            return True

        return False

    def index_job(self, job: Job) -> bool:
        """Add or update job in vector DB."""
        if not self.client and not self.index:
            return False

        data = self.embed_job(job)

        if self.use_chroma and CHROMADB_AVAILABLE:
            self.job_collection.add(
                ids=[data["id"]],
                embeddings=[data["embedding"]],
                metadatas=[data["metadata"]],
            )
            return True

        elif self.use_pinecone and PINECONE_AVAILABLE:
            self.job_index.upsert([
                (data["id"], data["embedding"], data["metadata"])
            ])
            return True

        return False

    def semantic_search_users(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict] = None,
    ) -> List[EmbeddingResult]:
        """Search users by semantic similarity."""
        if not self.client and not self.index:
            return []

        query_embedding = self._get_embedding(query)

        results = []

        if self.use_chroma and CHROMADB_AVAILABLE:
            chroma_results = self.user_collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=filters,
            )

            for i, doc_id in enumerate(chroma_results["ids"][0]):
                results.append(EmbeddingResult(
                    id=doc_id,
                    score=chroma_results["distances"][0][i],
                    metadata=chroma_results["metadatas"][0][i],
                ))

        elif self.use_pinecone and PINECONE_AVAILABLE:
            pinecone_results = self.user_index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=filters,
                include_metadata=True,
            )

            for match in pinecone_results["matches"]:
                results.append(EmbeddingResult(
                    id=match["id"],
                    score=match["score"],
                    metadata=match["metadata"],
                ))

        return results

    def semantic_search_jobs(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict] = None,
    ) -> List[EmbeddingResult]:
        """Search jobs by semantic similarity."""
        if not self.client and not self.index:
            return []

        query_embedding = self._get_embedding(query)

        results = []

        if self.use_chroma and CHROMADB_AVAILABLE:
            chroma_results = self.job_collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=filters,
            )

            for i, doc_id in enumerate(chroma_results["ids"][0]):
                results.append(EmbeddingResult(
                    id=doc_id,
                    score=chroma_results["distances"][0][i],
                    metadata=chroma_results["metadatas"][0][i],
                ))

        elif self.use_pinecone and PINECONE_AVAILABLE:
            pinecone_results = self.job_index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=filters,
                include_metadata=True,
            )

            for match in pinecone_results["matches"]:
                results.append(EmbeddingResult(
                    id=match["id"],
                    score=match["score"],
                    metadata=match["metadata"],
                ))

        return results


# Singleton instance
vector_db_service = VectorDBService()
