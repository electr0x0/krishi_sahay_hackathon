from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum


class AdminRole(str, enum.Enum):
    """Admin user roles with different permission levels"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MODERATOR = "moderator"
    SUPPORT = "support"


class AdminUser(Base):
    """Admin users with role-based access control"""
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SQLEnum(AdminRole), default=AdminRole.SUPPORT, nullable=False)
    is_active = Column(Integer, default=1)  # 1 = active, 0 = inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    activity_logs = relationship("ActivityLog", back_populates="admin_user")
    assigned_tickets = relationship("SupportTicket", back_populates="assigned_admin")
    
    def __repr__(self):
        return f"<AdminUser {self.email} ({self.role})>"


class ActivityLog(Base):
    """Log all admin actions for audit trail"""
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admin_users.id"), nullable=False)
    action = Column(String, nullable=False)  # 'user_suspended', 'sensor_configured', etc.
    target_type = Column(String)  # 'user', 'sensor', 'post', 'detection', etc.
    target_id = Column(Integer)
    details = Column(JSON)  # Additional context as JSON
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    admin_user = relationship("AdminUser", back_populates="activity_logs")
    
    def __repr__(self):
        return f"<ActivityLog {self.action} by admin_id={self.admin_id}>"


class TicketStatus(str, enum.Enum):
    """Support ticket status"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, enum.Enum):
    """Support ticket priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class SupportTicket(Base):
    """Support tickets from users"""
    __tablename__ = "support_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.OPEN, nullable=False)
    priority = Column(SQLEnum(TicketPriority), default=TicketPriority.MEDIUM, nullable=False)
    assigned_to = Column(Integer, ForeignKey("admin_users.id"))
    category = Column(String)  # 'technical', 'billing', 'feature_request', etc.
    resolution = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", backref="support_tickets")
    assigned_admin = relationship("AdminUser", back_populates="assigned_tickets")
    
    def __repr__(self):
        return f"<SupportTicket #{self.id} - {self.subject[:30]}>"


class ModerationStatus(str, enum.Enum):
    """Content moderation status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ModerationQueue(Base):
    """Queue for content that needs moderation"""
    __tablename__ = "moderation_queue"
    
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, nullable=False)  # 'post', 'listing', 'comment'
    content_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String)  # 'ai_flagged', 'user_reported', 'manual_review'
    status = Column(SQLEnum(ModerationStatus), default=ModerationStatus.PENDING, nullable=False)
    reviewed_by = Column(Integer, ForeignKey("admin_users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", backref="moderation_items")
    reviewer = relationship("AdminUser", backref="moderated_items")
    
    def __repr__(self):
        return f"<ModerationQueue {self.content_type} #{self.content_id} - {self.status}>"
