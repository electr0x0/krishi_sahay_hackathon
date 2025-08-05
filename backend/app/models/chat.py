from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Session Information
    session_id = Column(String, unique=True, index=True)  # UUID
    title = Column(String)  # Auto-generated or user-defined title
    session_type = Column(String, default="general")  # general, diagnosis, market, weather
    
    # Context Information
    language = Column(String, default="bn")  # bn, en
    location_context = Column(Text)  # JSON with location details
    crop_context = Column(Text)  # JSON with current crops
    season_context = Column(String)  # current farming season
    
    # Session Status
    is_active = Column(Boolean, default=True)
    is_starred = Column(Boolean, default=False)  # User can star important sessions
    
    # AI Context
    conversation_summary = Column(Text)  # AI-generated summary
    key_topics = Column(Text)  # JSON array of topics discussed
    action_items = Column(Text)  # JSON array of follow-up actions
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    
    # Message Content
    message_id = Column(String, unique=True, index=True)  # UUID
    content = Column(Text, nullable=False)
    original_content = Column(Text)  # If translated, store original
    language = Column(String, default="bn")
    
    # Message Type
    role = Column(String, nullable=False)  # user, assistant, system
    message_type = Column(String, default="text")  # text, image, audio, file
    
    # Media Content
    image_file = Column(String)  # Path to image file
    attachments = Column(Text)  # JSON array of file paths
    
    # Voice Recognition
    voice_confidence = Column(Float)  # Confidence score from STT
    voice_duration = Column(Float)  # Audio duration in seconds
    
    # AI Processing
    tool_calls = Column(Text)  # JSON array of tool calls made
    tool_outputs = Column(Text) # JSON object of raw tool outputs
    processing_time = Column(Float)  # Response generation time
    confidence_score = Column(Float)  # AI confidence in response
    
    # User Feedback
    user_rating = Column(Integer)  # 1-5 star rating
    user_feedback = Column(Text)  # User comments
    is_helpful = Column(Boolean)  # Thumbs up/down
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    edited_at = Column(DateTime(timezone=True))
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")