from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatSessionCreate(BaseModel):
    title: Optional[str] = None
    session_type: str = "general"
    language: str = "bn"
    location_context: Optional[Dict[str, Any]] = None
    crop_context: Optional[List[str]] = None
    season_context: Optional[str] = None

class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None
    session_type: Optional[str] = None
    language: Optional[str] = None
    location_context: Optional[Dict[str, Any]] = None
    crop_context: Optional[List[str]] = None
    season_context: Optional[str] = None
    is_active: Optional[bool] = None
    is_starred: Optional[bool] = None

class ChatSession(BaseModel):
    id: int
    user_id: int
    session_id: str
    title: str
    session_type: str
    language: str
    location_context: Optional[str] = None
    crop_context: Optional[str] = None
    season_context: Optional[str] = None
    is_active: bool
    is_starred: bool
    conversation_summary: Optional[str] = None
    key_topics: Optional[str] = None
    action_items: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_activity: datetime
    
    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    content: str
    language: Optional[str] = None
    message_type: str = "text"  # text, voice, image
    image_file: Optional[str] = None
    attachments: Optional[List[str]] = None
    voice_confidence: Optional[float] = None  # From frontend Web Speech API
    voice_duration: Optional[float] = None

class ChatMessage(BaseModel):
    id: int
    session_id: int
    message_id: str
    content: str
    original_content: Optional[str] = None
    language: str
    role: str
    message_type: str
    image_file: Optional[str] = None
    attachments: Optional[str] = None
    voice_confidence: Optional[float] = None
    voice_duration: Optional[float] = None
    tool_calls: Optional[str] = None
    tool_outputs: Optional[str] = None
    processing_time: Optional[float] = None
    confidence_score: Optional[float] = None
    user_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    is_helpful: Optional[bool] = None
    created_at: datetime
    edited_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    user_message: ChatMessage
    ai_message: ChatMessage
    session_id: str
    processing_time: Optional[float] = None
    error: Optional[str] = None
    success: bool = True