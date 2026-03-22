"""Ollama Cloud AI service with multiple GPT models for different purposes."""
import os
import json
import asyncio
from typing import Optional, Dict, List, Any, AsyncGenerator
from enum import Enum
import aiohttp
from datetime import datetime


class ModelPurpose(str, Enum):
    """AI model purposes for different tasks."""
    MATCHING = "matching"  # Candidate-job matching
    SUPPORT = "support"      # Customer support
    COACHING = "coaching"    # Career coaching
    CONTENT = "content"      # Content generation
    CODE = "code"            # Code generation
    ANALYSIS = "analysis"    # Data analysis
    CHAT = "chat"            # General chat


class OllamaConfig:
    """Configuration for Ollama Cloud API."""

    API_KEY = os.getenv("OLLAMA_API_KEY", "")
    BASE_URL = os.getenv("OLLAMA_BASE_URL", "https://api.ollama.com/v1")

    # Model mapping for different purposes
    MODELS = {
        ModelPurpose.MATCHING: os.getenv("OLLAMA_MATCHING_MODEL", "llama3.1:70b"),
        ModelPurpose.SUPPORT: os.getenv("OLLAMA_SUPPORT_MODEL", "llama3.1:8b"),
        ModelPurpose.COACHING: os.getenv("OLLAMA_COACHING_MODEL", "llama3.1:70b"),
        ModelPurpose.CONTENT: os.getenv("OLLAMA_CONTENT_MODEL", "mixtral:8x7b"),
        ModelPurpose.CODE: os.getenv("OLLAMA_CODE_MODEL", "codellama:34b"),
        ModelPurpose.ANALYSIS: os.getenv("OLLAMA_ANALYSIS_MODEL", "llama3.1:70b"),
        ModelPurpose.CHAT: os.getenv("OLLAMA_CHAT_MODEL", "llama3.1:8b"),
    }

    # Model-specific parameters
    DEFAULT_PARAMS = {
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 2048,
    }

    PURPOSE_PARAMS = {
        ModelPurpose.MATCHING: {"temperature": 0.3, "top_p": 0.95},  # More deterministic
        ModelPurpose.SUPPORT: {"temperature": 0.5, "top_p": 0.9},
        ModelPurpose.COACHING: {"temperature": 0.8, "top_p": 0.95},  # More creative
        ModelPurpose.CONTENT: {"temperature": 0.9, "top_p": 0.95},
        ModelPurpose.CODE: {"temperature": 0.2, "top_p": 0.9},
        ModelPurpose.ANALYSIS: {"temperature": 0.3, "top_p": 0.95},
        ModelPurpose.CHAT: {"temperature": 0.7, "top_p": 0.9},
    }


class OllamaService:
    """Ollama Cloud AI service for Maiki."""

    def __init__(self):
        self.api_key = OllamaConfig.API_KEY
        self.base_url = OllamaConfig.BASE_URL
        self.session: Optional[aiohttp.ClientSession] = None
        self._conversation_history: Dict[str, List[Dict[str, str]]] = {}

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                }
            )
        return self.session

    def _get_model(self, purpose: ModelPurpose) -> str:
        """Get model for specific purpose."""
        return OllamaConfig.MODELS.get(purpose, OllamaConfig.MODELS[ModelPurpose.CHAT])

    def _get_params(self, purpose: ModelPurpose) -> Dict[str, Any]:
        """Get parameters for specific purpose."""
        params = OllamaConfig.DEFAULT_PARAMS.copy()
        params.update(OllamaConfig.PURPOSE_PARAMS.get(purpose, {}))
        return params

    def _build_system_prompt(self, purpose: ModelPurpose, context: Optional[Dict] = None) -> str:
        """Build system prompt based on purpose."""
        prompts = {
            ModelPurpose.MATCHING: """You are Maiki's AI Matching Assistant. Your role is to:
- Analyze job requirements and candidate profiles
- Calculate match scores based on skills, experience, and preferences
- Provide detailed explanations for matches
- Suggest skill gaps and improvement areas
Be professional, objective, and data-driven in your analysis.""",

            ModelPurpose.SUPPORT: """You are Maiki's Support Assistant. Your role is to:
- Help users navigate the platform
- Answer questions about features, billing, and account issues
- Provide troubleshooting guidance
- Escalate complex issues when needed
Be friendly, helpful, and concise. Always aim to resolve issues quickly.""",

            ModelPurpose.COACHING: """You are Maiki's Career Coach. Your role is to:
- Provide personalized career advice for VAs
- Help with skill development planning
- Offer interview preparation tips
- Guide pricing and rate negotiations
- Suggest learning resources and certifications
Be encouraging, insightful, and practical in your advice.""",

            ModelPurpose.CONTENT: """You are Maiki's Content Assistant. Your role is to:
- Write professional job descriptions
- Create engaging profile summaries
- Draft proposals and cover letters
- Generate marketing copy
Be creative, professional, and tailor content to the virtual assistant industry.""",

            ModelPurpose.CODE: """You are Maiki's Technical Assistant. Your role is to:
- Help with technical integrations
- Provide code examples for API usage
- Debug automation scripts
- Explain technical concepts
Be precise, thorough, and provide working code examples.""",

            ModelPurpose.ANALYSIS: """You are Maiki's Data Analyst. Your role is to:
- Interpret analytics and metrics
- Provide insights on market trends
- Analyze performance data
- Generate reports summaries
Be analytical, clear, and actionable in your insights.""",

            ModelPurpose.CHAT: """You are Maiki, a helpful AI assistant for the Maiki Virtual Assistant marketplace.
You help users with general questions, navigation, and platform features.
Be friendly, knowledgeable, and conversational.""",
        }

        base_prompt = prompts.get(purpose, prompts[ModelPurpose.CHAT])

        if context:
            context_str = json.dumps(context, indent=2)
            base_prompt += f"\n\nContext:\n{context_str}"

        return base_prompt

    async def generate(
        self,
        prompt: str,
        purpose: ModelPurpose = ModelPurpose.CHAT,
        context: Optional[Dict] = None,
        conversation_id: Optional[str] = None,
        stream: bool = False,
    ) -> Dict[str, Any]:
        """Generate AI response."""
        if not self.api_key:
            return {
                "error": "Ollama API key not configured",
                "response": "I'm sorry, the AI service is not configured. Please contact support.",
            }

        session = await self._get_session()
        model = self._get_model(purpose)
        params = self._get_params(purpose)

        # Build messages
        messages = []

        # System prompt
        system_prompt = self._build_system_prompt(purpose, context)
        messages.append({"role": "system", "content": system_prompt})

        # Conversation history
        if conversation_id and conversation_id in self._conversation_history:
            messages.extend(self._conversation_history[conversation_id])

        # User message
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            **params,
        }

        try:
            async with session.post(
                f"{self.base_url}/chat",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60),
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Ollama API error: {response.status} - {error_text}")

                result = await response.json()

                # Extract response
                ai_message = result.get("message", {}).get("content", "")

                # Store in conversation history
                if conversation_id:
                    if conversation_id not in self._conversation_history:
                        self._conversation_history[conversation_id] = []
                    self._conversation_history[conversation_id].append(
                        {"role": "user", "content": prompt}
                    )
                    self._conversation_history[conversation_id].append(
                        {"role": "assistant", "content": ai_message}
                    )
                    # Keep last 20 messages
                    self._conversation_history[conversation_id] = self._conversation_history[conversation_id][-20:]

                return {
                    "response": ai_message,
                    "model": model,
                    "purpose": purpose.value,
                    "usage": result.get("usage", {}),
                    "conversation_id": conversation_id,
                }

        except Exception as e:
            return {
                "error": str(e),
                "response": "I apologize, but I'm having trouble connecting to the AI service. Please try again in a moment.",
                "model": model,
                "purpose": purpose.value,
            }

    async def stream_generate(
        self,
        prompt: str,
        purpose: ModelPurpose = ModelPurpose.CHAT,
        context: Optional[Dict] = None,
        conversation_id: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream AI response."""
        if not self.api_key:
            yield "I'm sorry, the AI service is not configured. Please contact support."
            return

        session = await self._get_session()
        model = self._get_model(purpose)
        params = self._get_params(purpose)

        messages = []
        system_prompt = self._build_system_prompt(purpose, context)
        messages.append({"role": "system", "content": system_prompt})

        if conversation_id and conversation_id in self._conversation_history:
            messages.extend(self._conversation_history[conversation_id])

        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            **params,
        }

        try:
            async with session.post(
                f"{self.base_url}/chat",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=120),
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Ollama API error: {response.status}")

                full_response = []
                async for line in response.content:
                    line = line.decode('utf-8').strip()
                    if line.startswith('data: '):
                        data = line[6:]
                        if data == '[DONE]':
                            break
                        try:
                            chunk = json.loads(data)
                            content = chunk.get('message', {}).get('content', '')
                            if content:
                                yield content
                                full_response.append(content)
                        except json.JSONDecodeError:
                            continue

                # Store complete response
                if conversation_id:
                    if conversation_id not in self._conversation_history:
                        self._conversation_history[conversation_id] = []
                    self._conversation_history[conversation_id].append(
                        {"role": "user", "content": prompt}
                    )
                    self._conversation_history[conversation_id].append(
                        {"role": "assistant", "content": ''.join(full_response)}
                    )
                    self._conversation_history[conversation_id] = self._conversation_history[conversation_id][-20:]

        except Exception as e:
            yield f"I apologize, but I'm having trouble connecting: {str(e)}"

    def clear_conversation(self, conversation_id: str):
        """Clear conversation history."""
        if conversation_id in self._conversation_history:
            del self._conversation_history[conversation_id]

    async def close(self):
        """Close session."""
        if self.session and not self.session.closed:
            await self.session.close()


# Convenience methods for specific use cases
class MaikiAI:
    """High-level AI interface for Maiki features."""

    def __init__(self):
        self.service = OllamaService()

    async def match_candidates(self, job_description: str, candidate_profiles: List[Dict]) -> Dict:
        """Match candidates to a job."""
        context = {
            "job": job_description,
            "candidates": candidate_profiles,
        }
        prompt = """Analyze these candidates for the job position. Provide:
1. Match scores (0-100) for each candidate
2. Key matching factors
3. Skill gaps
4. Ranking with explanation"""

        return await self.service.generate(
            prompt=prompt,
            purpose=ModelPurpose.MATCHING,
            context=context,
        )

    async def coach_career(self, user_profile: Dict, question: str) -> Dict:
        """Provide career coaching."""
        context = {"profile": user_profile}
        return await self.service.generate(
            prompt=question,
            purpose=ModelPurpose.COACHING,
            context=context,
        )

    async def generate_job_description(self, requirements: Dict) -> Dict:
        """Generate job description."""
        prompt = f"""Create a professional job description with the following:
Title: {requirements.get('title', '')}
Type: {requirements.get('type', '')}
Skills needed: {', '.join(requirements.get('skills', []))}
Budget: {requirements.get('budget', '')}
Experience level: {requirements.get('experience', '')}

Write an engaging, clear job description that will attract quality VAs."""

        return await self.service.generate(
            prompt=prompt,
            purpose=ModelPurpose.CONTENT,
        )

    async def support_chat(self, message: str, user_context: Optional[Dict] = None) -> Dict:
        """Handle support chat."""
        return await self.service.generate(
            prompt=message,
            purpose=ModelPurpose.SUPPORT,
            context=user_context,
        )

    async def analyze_skills_gap(self, current_skills: List[str], target_role: str) -> Dict:
        """Analyze skills gap."""
        context = {
            "current_skills": current_skills,
            "target_role": target_role,
        }
        prompt = """Analyze the skills gap and provide:
1. Missing critical skills
2. Recommended learning path
3. Time estimate to proficiency
4. Resource recommendations"""

        return await self.service.generate(
            prompt=prompt,
            purpose=ModelPurpose.ANALYSIS,
            context=context,
        )

    async def stream_chat(
        self,
        message: str,
        conversation_id: str,
        purpose: ModelPurpose = ModelPurpose.CHAT,
    ) -> AsyncGenerator[str, None]:
        """Stream chat response."""
        async for chunk in self.service.stream_generate(
            prompt=message,
            purpose=purpose,
            conversation_id=conversation_id,
        ):
            yield chunk


# Singleton instance
ollama_service = OllamaService()
maiki_ai = MaikiAI()
