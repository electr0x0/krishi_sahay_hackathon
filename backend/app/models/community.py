from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class MemberRole(enum.Enum):
    LEADER = "leader"
    CO_LEADER = "co-leader"
    ELDER = "elder"
    MEMBER = "member"

class HelpCategory(enum.Enum):
    EQUIPMENT = "equipment"
    LABOR = "labor"
    KNOWLEDGE = "knowledge"
    FINANCIAL = "financial"
    OTHER = "other"

class UrgencyLevel(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class HelpStatus(enum.Enum):
    OPEN = "open"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventType(enum.Enum):
    TRAINING = "training"
    CHARITY = "charity"
    CULTURAL = "cultural"
    MEETING = "meeting"
    CELEBRATION = "celebration"

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    area = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    image_url = Column(String(500), nullable=True)
    
    # Relationships
    members = relationship("CommunityMember", back_populates="community")
    help_requests = relationship("HelpRequest", back_populates="community")
    events = relationship("CommunityEvent", back_populates="community")
    chat_messages = relationship("CommunityMessage", back_populates="community")

class CommunityMember(Base):
    __tablename__ = "community_members"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(MemberRole), default=MemberRole.MEMBER)
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    contribution_points = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    community = relationship("Community", back_populates="members")
    user = relationship("User", back_populates="community_memberships")
    help_requests = relationship("HelpRequest", foreign_keys="HelpRequest.requester_id", back_populates="requester")
    accepted_help_requests = relationship("HelpRequest", foreign_keys="HelpRequest.accepted_by_id", back_populates="accepted_by")
    events = relationship("CommunityEvent", back_populates="organizer")

class HelpRequest(Base):
    __tablename__ = "help_requests"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    requester_id = Column(Integer, ForeignKey("community_members.id"), nullable=False)
    accepted_by_id = Column(Integer, ForeignKey("community_members.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(HelpCategory), nullable=False)
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    location = Column(String(255), nullable=False)
    is_paid = Column(Boolean, default=False)
    amount = Column(Integer, nullable=True)
    status = Column(Enum(HelpStatus), default=HelpStatus.OPEN)
    tags = Column(Text, nullable=True)  # JSON string of tags
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    community = relationship("Community", back_populates="help_requests")
    requester = relationship("CommunityMember", foreign_keys=[requester_id], back_populates="help_requests")
    accepted_by = relationship("CommunityMember", foreign_keys=[accepted_by_id], back_populates="accepted_help_requests")

class CommunityEvent(Base):
    __tablename__ = "community_events"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    organizer_id = Column(Integer, ForeignKey("community_members.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(Enum(EventType), nullable=False)
    location = Column(String(255), nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)
    event_time = Column(String(50), nullable=True)
    max_attendees = Column(Integer, nullable=True)
    is_free = Column(Boolean, default=True)
    fee = Column(Integer, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    community = relationship("Community", back_populates="events")
    organizer = relationship("CommunityMember", back_populates="events")
    attendees = relationship("EventAttendee", back_populates="event")

class EventAttendee(Base):
    __tablename__ = "event_attendees"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("community_events.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("community_members.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    event = relationship("CommunityEvent", back_populates="attendees")
    member = relationship("CommunityMember")
