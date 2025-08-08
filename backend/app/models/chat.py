from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String(255), unique=True, index=True)
    title = Column(String(500), default="নতুন কথোপকথন")
    session_type = Column(String(50), default="general")
    language = Column(String(10), default="bn")
    location_context = Column(JSON, nullable=True)
    crop_context = Column(JSON, nullable=True)
    season_context = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    is_starred = Column(Boolean, default=False)
    conversation_summary = Column(Text, nullable=True)
    key_topics = Column(JSON, nullable=True)
    action_items = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    message_id = Column(String(255), unique=True, index=True)
    content = Column(Text)
    original_content = Column(Text, nullable=True)
    language = Column(String(10), default="bn")
    role = Column(String(20), default="user")  # user, assistant
    message_type = Column(String(20), default="text")  # text, voice, image
    image_file = Column(String(500), nullable=True)
    attachments = Column(JSON, nullable=True)
    voice_confidence = Column(Float, nullable=True)
    voice_duration = Column(Float, nullable=True)
    tool_calls = Column(JSON, nullable=True)
    tool_outputs = Column(JSON, nullable=True)
    processing_time = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    user_rating = Column(Integer, nullable=True)
    user_feedback = Column(Text, nullable=True)
    is_helpful = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime, nullable=True)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")

# Community chat models
class CommunityMessageType(enum.Enum):
    TEXT = "text"
    HELP_REQUEST = "help_request"
    EVENT = "event"
    SYSTEM = "system"

from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.dialects.postgresql import JSONB

class CommunityMessage(Base):
    __tablename__ = "community_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message_type = Column(SQLEnum(CommunityMessageType), default=CommunityMessageType.TEXT, nullable=False)
    content = Column(Text, nullable=False)
    message_metadata = Column(MutableDict.as_mutable(JSON), nullable=True)  # JSON for additional data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    community = relationship("Community", back_populates="chat_messages")
    user = relationship("User")

# For backward compatibility
MessageType = CommunityMessageType