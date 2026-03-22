"""Chatbot API routes."""
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import json
import uuid

from app.deps import get_db, get_current_user_optional, get_current_user
from app.models import User
from app.services.ollama_service import (
    OllamaService, MaikiAI, ModelPurpose, ollama_service, maiki_ai
)

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


class ConnectionManager:
    """WebSocket connection manager."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.user_sessions: dict[str, str] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.user_sessions:
            del self.user_sessions[client_id]

    async def send_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)

    def set_session(self, client_id: str, conversation_id: str):
        self.user_sessions[client_id] = conversation_id

    def get_session(self, client_id: str) -> Optional[str]:
        return self.user_sessions.get(client_id)


manager = ConnectionManager()


@router.post("/chat")
async def chat(
    message: str,
    purpose: str = "chat",
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Send a chat message and get AI response."""
    try:
        # Map purpose string to enum
        purpose_map = {
            "chat": ModelPurpose.CHAT,
            "matching": ModelPurpose.MATCHING,
            "support": ModelPurpose.SUPPORT,
            "coaching": ModelPurpose.COACHING,
            "content": ModelPurpose.CONTENT,
        }
        model_purpose = purpose_map.get(purpose, ModelPurpose.CHAT)

        # Create conversation context
        context = {}
        if current_user:
            context = {
                "user_id": current_user.id,
                "name": f"{current_user.first_name} {current_user.last_name}",
                "role": current_user.role.value if current_user.role else None,
                "tier": current_user.tier.value if current_user.tier else None,
                "skills": [s.name for s in current_user.skills],
            }

        # Generate new conversation ID if not provided
        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        result = await maiki_ai.service.generate(
            prompt=message,
            purpose=model_purpose,
            context=context if context else None,
            conversation_id=conversation_id,
        )

        return {
            "response": result.get("response"),
            "conversation_id": conversation_id,
            "purpose": purpose,
            "model": result.get("model"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(
    message: str,
    purpose: str = "chat",
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Stream chat response (SSE)."""
    from fastapi.responses import StreamingResponse
    import asyncio

    async def generate():
        purpose_map = {
            "chat": ModelPurpose.CHAT,
            "matching": ModelPurpose.MATCHING,
            "support": ModelPurpose.SUPPORT,
            "coaching": ModelPurpose.COACHING,
        }
        model_purpose = purpose_map.get(purpose, ModelPurpose.CHAT)

        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        context = {}
        if current_user:
            context = {
                "user_id": current_user.id,
                "name": f"{current_user.first_name} {current_user.last_name}",
            }

        yield f"data: {json.dumps({'type': 'start', 'conversation_id': conversation_id})}\n\n"

        full_response = []
        async for chunk in maiki_ai.service.stream_generate(
            prompt=message,
            purpose=model_purpose,
            context=context if context else None,
            conversation_id=conversation_id,
        ):
            full_response.append(chunk)
            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            await asyncio.sleep(0.01)

        yield f"data: {json.dumps({'type': 'end', 'full_response': ''.join(full_response)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
    )


@router.websocket("/ws/{client_id}")
async def websocket_chat(
    websocket: WebSocket,
    client_id: str,
    db: Session = Depends(get_db),
):
    """WebSocket endpoint for real-time chat."""
    await manager.connect(websocket, client_id)

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            message = message_data.get("message", "")
            purpose = message_data.get("purpose", "chat")
            conversation_id = message_data.get("conversation_id") or manager.get_session(client_id)

            if not conversation_id:
                conversation_id = str(uuid.uuid4())
                manager.set_session(client_id, conversation_id)

            # Map purpose
            purpose_map = {
                "chat": ModelPurpose.CHAT,
                "matching": ModelPurpose.MATCHING,
                "support": ModelPurpose.SUPPORT,
                "coaching": ModelPurpose.COACHING,
            }
            model_purpose = purpose_map.get(purpose, ModelPurpose.CHAT)

            # Stream response
            await manager.send_message(client_id, {
                "type": "start",
                "conversation_id": conversation_id,
            })

            full_response = []
            async for chunk in maiki_ai.service.stream_generate(
                prompt=message,
                purpose=model_purpose,
                conversation_id=conversation_id,
            ):
                full_response.append(chunk)
                await manager.send_message(client_id, {
                    "type": "chunk",
                    "content": chunk,
                })

            await manager.send_message(client_id, {
                "type": "end",
                "full_response": "".join(full_response),
                "conversation_id": conversation_id,
            })

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        await manager.send_message(client_id, {
            "type": "error",
            "error": str(e),
        })
        manager.disconnect(client_id)


@router.post("/conversations/{conversation_id}/clear")
async def clear_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Clear conversation history."""
    maiki_ai.service.clear_conversation(conversation_id)
    return {"message": "Conversation cleared"}


@router.post("/coaching/career")
async def career_coaching(
    question: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get career coaching advice."""
    user_profile = {
        "name": f"{current_user.first_name} {current_user.last_name}",
        "tier": current_user.tier.value if current_user.tier else None,
        "skills": [s.name for s in current_user.skills],
        "hourly_rate": float(current_user.hourly_rate_min) if current_user.hourly_rate_min else None,
        "rating": float(current_user.rating) if current_user.rating else None,
    }

    result = await maiki_ai.coach_career(user_profile, question)
    return result


@router.post("/content/generate")
async def generate_content(
    content_type: str,  # job_description, profile_summary, proposal
    data: dict,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate content using AI."""
    if content_type == "job_description":
        result = await maiki_ai.generate_job_description(data)
    else:
        prompt_map = {
            "profile_summary": "Create a professional profile summary for a VA based on their skills and experience.",
            "proposal": "Write a compelling proposal for a VA job application.",
        }
        prompt = prompt_map.get(content_type, "Generate content")
        result = await maiki_ai.service.generate(
            prompt=prompt,
            purpose=ModelPurpose.CONTENT,
            context=data,
        )

    return result


@router.post("/support")
async def support_request(
    message: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Handle support request with AI."""
    context = {}
    if current_user:
        context = {
            "user_id": current_user.id,
            "email": current_user.email,
            "category": category,
        }

    result = await maiki_ai.support_chat(message, context)
    return result
