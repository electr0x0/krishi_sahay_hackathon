from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import json

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatSessionCreate, ChatSession as ChatSessionSchema,
    ChatMessageCreate, ChatMessage as ChatMessageSchema,
    ChatSessionUpdate, ChatResponse
)
from app.auth.dependencies import get_current_user
from app.services.agent import run_enhanced_agent
from app.services.translation_service import translation_service

router = APIRouter()

@router.post("/sessions", response_model=ChatSessionSchema)
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat session."""
    
    session_id = str(uuid.uuid4())
    
    session = ChatSession(
        user_id=current_user.id,
        session_id=session_id,
        title=session_data.title or "নতুন কথোপকথন",
        session_type=session_data.session_type,
        language=session_data.language,
        location_context=json.dumps(session_data.location_context) if session_data.location_context else None,
        crop_context=json.dumps(session_data.crop_context) if session_data.crop_context else None,
        season_context=session_data.season_context
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return session

@router.get("/sessions", response_model=List[ChatSessionSchema])
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get all chat sessions for the current user."""
    
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.last_activity.desc()).offset(offset).limit(limit).all()
    
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionSchema)
async def get_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific chat session."""
    
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    
    return session

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageSchema])
async def get_chat_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0
):
    """Get chat message history for a session."""
    
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).offset(offset).limit(limit).all()
    
    return messages

@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(
    session_id: str,
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message and get AI response with structured tool output."""
    
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    
    # Save user message
    user_message = ChatMessage(
        session_id=session.id,
        message_id=str(uuid.uuid4()),
        content=message_data.content,
        language=message_data.language or session.language,
        role="user",
        message_type=message_data.message_type,
        voice_confidence=message_data.voice_confidence,
        voice_duration=message_data.voice_duration
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Prepare user context for AI
    user_context = {
        "user_id": current_user.id,
        "language": session.language,
        "location": {
            "district": current_user.district,
            "lat": current_user.latitude, 
            "lon": current_user.longitude
        }
    }
    
    try:
        # Get AI response and tool outputs
        ai_response = await run_enhanced_agent(
            query=message_data.content,
            user_context=user_context,
            session_id=session_id,
            language=session.language
        )
        
        # Save AI response
        ai_message = ChatMessage(
            session_id=session.id,
            message_id=str(uuid.uuid4()),
            content=ai_response.get("content", "Sorry, I couldn't generate a response."),
            language=session.language,
            role="assistant",
            message_type="text",
            tool_calls=json.dumps(ai_response.get("tool_calls", [])),
            tool_outputs=json.dumps(ai_response.get("tool_outputs", {})), # Store raw tool output
            processing_time=ai_response.get("processing_time", 0)
        )
        db.add(ai_message)
        
        # Update session activity
        session.last_activity = datetime.now()
        db.commit()
        db.refresh(ai_message)
        
        return ChatResponse(
            user_message=user_message,
            ai_message=ai_message,
            session_id=session_id,
            success=True
        )
        
    except Exception as e:
        error_message = "দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
        ai_message = ChatMessage(
            session_id=session.id,
            message_id=str(uuid.uuid4()),
            content=error_message,
            language=session.language,
            role="assistant",
            message_type="text"
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        
        return ChatResponse(
            user_message=user_message,
            ai_message=ai_message,
            session_id=session_id,
            error=str(e),
            success=False
        )

@router.put("/sessions/{session_id}", response_model=ChatSessionSchema)
async def update_chat_session(
    session_id: str,
    session_update: ChatSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a chat session (title, star status, etc.)."""
    
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    
    for field, value in session_update.model_dump(exclude_unset=True).items():
        if field in ['location_context', 'crop_context'] and value is not None:
            value = json.dumps(value)
        setattr(session, field, value)
    
    session.updated_at = datetime.now()
    db.commit()
    db.refresh(session)
    
    return session

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chat session and all its messages."""
    
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    
    db.delete(session)
    db.commit()
    
    return {"message": "Chat session deleted successfully"}

# Voice message endpoint (separate from regular messages for different processing)
@router.post("/sessions/{session_id}/voice", response_model=ChatResponse)
async def send_voice_message(
    session_id: str,
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a voice message - same as regular message but with voice-specific metadata."""
    
    # Set message type to voice
    message_data.message_type = "voice"
    
    # Use the same logic as send_message
    return await send_message(session_id, message_data, current_user, db)