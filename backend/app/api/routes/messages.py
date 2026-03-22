"""Message routes for real-time chat."""
from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func

from app.deps import get_db, get_current_user, get_current_user_ws
from app.models import (
    User, Conversation, Message, ConversationParticipant,
    MessageReadReceipt, Application, Job
)
from app.schemas import (
    ConversationCreate, ConversationResponse, MessageCreate,
    MessageResponse, PaginatedResponse
)
from app.core.config import settings

router = APIRouter(prefix="/messages", tags=["messages"])


# ============= CONVERSATION ROUTES =============

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List user's conversations ordered by most recent activity."""
    # Get conversations where user is a participant
    participant_query = db.query(ConversationParticipant).filter(
        ConversationParticipant.user_id == current_user.id
    ).subquery()

    conversations = db.query(Conversation).join(
        participant_query,
        Conversation.id == participant_query.c.conversation_id
    ).order_by(desc(Conversation.last_message_at or Conversation.created_at)).offset(skip).limit(limit).all()

    # Add participant info and unread counts
    for conv in conversations:
        conv.participants_list = [
            {"id": p.user_id, "first_name": p.user.first_name, "last_name": p.user.last_name,
             "avatar_url": p.user.avatar_url, "role": p.role}
            for p in conv.participants if p.user_id != current_user.id
        ]

        # Get unread count
        participant = next((p for p in conv.participants if p.user_id == current_user.id), None)
        conv.unread_count = participant.unread_count if participant else 0

    return conversations


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    *,
    db: Session = Depends(get_db),
    conversation_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new conversation."""
    # Check if direct conversation already exists between these users
    if conversation_in.type == "direct" and len(conversation_in.participant_ids) == 1:
        other_user_id = conversation_in.participant_ids[0]

        # Find existing direct conversation
        existing = db.query(Conversation).join(
            ConversationParticipant
        ).filter(
            Conversation.type == "direct",
            ConversationParticipant.user_id.in_([current_user.id, other_user_id])
        ).group_by(Conversation.id).having(
            func.count(ConversationParticipant.id) == 2
        ).first()

        if existing:
            return existing

    # Create new conversation
    conversation = Conversation(
        type=conversation_in.type,
        job_id=conversation_in.job_id,
        application_id=conversation_in.application_id,
        title=conversation_in.title,
    )
    db.add(conversation)
    db.flush()  # Get conversation.id

    # Add creator as owner
    creator_participant = ConversationParticipant(
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(creator_participant)

    # Add other participants
    for participant_id in conversation_in.participant_ids:
        if participant_id == current_user.id:
            continue
        # Verify user exists
        user = db.query(User).filter(User.id == participant_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User {participant_id} not found"
            )

        participant = ConversationParticipant(
            conversation_id=conversation.id,
            user_id=participant_id,
            role="member"
        )
        db.add(participant)

    db.commit()
    db.refresh(conversation)

    return conversation


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get conversation details."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check if user is participant
    is_participant = any(p.user_id == current_user.id for p in conversation.participants)
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this conversation"
        )

    return conversation


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete/archived conversation."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Only owner can delete
    participant = next((p for p in conversation.participants if p.user_id == current_user.id), None)
    if not participant or participant.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only conversation owner can delete"
        )

    conversation.is_active = False
    db.commit()

    return {"message": "Conversation archived"}


# ============= MESSAGE ROUTES =============

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def list_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    before_id: Optional[int] = Query(None),
) -> Any:
    """Get messages in a conversation."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check if user is participant
    is_participant = any(p.user_id == current_user.id for p in conversation.participants)
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view messages in this conversation"
        )

    # Build query
    query = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.is_deleted == False
    )

    if before_id:
        query = query.filter(Message.id < before_id)

    messages = query.order_by(desc(Message.created_at)).offset(skip).limit(limit).all()

    # Mark messages as read for current user
    participant = next((p for p in conversation.participants if p.user_id == current_user.id), None)
    if participant:
        participant.last_read_at = datetime.utcnow()
        participant.unread_count = 0
        db.commit()

    return messages


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
def create_message(
    *,
    conversation_id: int,
    db: Session = Depends(get_db),
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Send a message to a conversation."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.is_active == True
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check if user is participant
    is_participant = any(p.user_id == current_user.id for p in conversation.participants)
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send messages in this conversation"
        )

    # Create message
    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        type=message_in.type,
        content=message_in.content,
        file_url=message_in.file_url,
        file_name=message_in.file_name,
        file_size=message_in.file_size,
    )
    db.add(message)

    # Update conversation last message time
    conversation.last_message_at = datetime.utcnow()

    # Update unread counts for other participants
    for participant in conversation.participants:
        if participant.user_id != current_user.id:
            participant.unread_count += 1

    db.commit()
    db.refresh(message)

    # Add sender info
    message.sender_name = f"{current_user.first_name} {current_user.last_name}"
    message.sender_avatar = current_user.avatar_url

    return message


@router.put("/messages/{message_id}", response_model=MessageResponse)
def update_message(
    *,
    message_id: int,
    db: Session = Depends(get_db),
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Edit a message (only by sender)."""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only edit your own messages"
        )

    if message.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit deleted messages"
        )

    message.content = message_in.content
    message.is_edited = True
    message.edited_at = datetime.utcnow()

    db.commit()
    db.refresh(message)

    return message


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Soft delete a message (only by sender or admin)."""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    if message.sender_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete your own messages"
        )

    message.is_deleted = True
    message.deleted_at = datetime.utcnow()
    message.content = "[Message deleted]"

    db.commit()

    return {"message": "Message deleted"}


@router.post("/messages/{message_id}/read")
def mark_message_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Mark a specific message as read."""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    # Check if already read
    existing = db.query(MessageReadReceipt).filter(
        MessageReadReceipt.message_id == message_id,
        MessageReadReceipt.user_id == current_user.id
    ).first()

    if not existing:
        receipt = MessageReadReceipt(
            message_id=message_id,
            user_id=current_user.id
        )
        db.add(receipt)
        db.commit()

    return {"message": "Marked as read"}


# ============= WEBSOCKET FOR REAL-TIME =============

class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def broadcast_to_conversation(self, message: dict, conversation_participants: list[int], exclude: int = None):
        """Broadcast message to all conversation participants."""
        for user_id in conversation_participants:
            if user_id != exclude and user_id in self.active_connections:
                await self.active_connections[user_id].send_json(message)


manager = ConnectionManager()


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time messaging."""
    # TODO: Validate token and get user
    # For now, placeholder
    user_id = 1  # Should decode from token

    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            # Handle different message types
            msg_type = data.get("type")

            if msg_type == "message":
                # Handle new message
                conversation_id = data.get("conversation_id")
                content = data.get("content")

                # Broadcast to conversation participants
                await manager.broadcast_to_conversation(
                    {
                        "type": "new_message",
                        "conversation_id": conversation_id,
                        "sender_id": user_id,
                        "content": content,
                        "timestamp": datetime.utcnow().isoformat()
                    },
                    data.get("participants", []),
                    exclude=user_id
                )

            elif msg_type == "typing":
                # Broadcast typing indicator
                await manager.broadcast_to_conversation(
                    {
                        "type": "typing",
                        "conversation_id": data.get("conversation_id"),
                        "user_id": user_id
                    },
                    data.get("participants", []),
                    exclude=user_id
                )

            elif msg_type == "read":
                # Broadcast read receipt
                await manager.broadcast_to_conversation(
                    {
                        "type": "read_receipt",
                        "conversation_id": data.get("conversation_id"),
                        "user_id": user_id,
                        "message_id": data.get("message_id")
                    },
                    data.get("participants", []),
                    exclude=user_id
                )

    except WebSocketDisconnect:
        manager.disconnect(user_id)
