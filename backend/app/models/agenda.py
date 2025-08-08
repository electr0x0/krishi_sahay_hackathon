from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class AgendaPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class AgendaStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AgendaType(str, enum.Enum):
    USER_CREATED = "user_created"
    AI_SUGGESTED = "ai_suggested"
    WEATHER_ALERT = "weather_alert"
    SENSOR_ALERT = "sensor_alert"
    MAINTENANCE = "maintenance"
    HARVESTING = "harvesting"
    PLANTING = "planting"
    IRRIGATION = "irrigation"
    FERTILIZATION = "fertilization"


class Agenda(Base):
    __tablename__ = "agendas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    priority = Column(Enum(AgendaPriority), default=AgendaPriority.MEDIUM)
    status = Column(Enum(AgendaStatus), default=AgendaStatus.PENDING)
    agenda_type = Column(Enum(AgendaType), default=AgendaType.USER_CREATED)
    
    # Timing
    scheduled_date = Column(DateTime, nullable=True)  # When the task should be done
    due_date = Column(DateTime, nullable=True)  # Deadline
    estimated_duration = Column(Integer, nullable=True)  # In minutes
    
    # User and assignment
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_ai = Column(Boolean, default=False)
    
    # AI context
    ai_reasoning = Column(Text, nullable=True)  # Why AI suggested this
    source_data = Column(Text, nullable=True)  # JSON string of source data used
    
    # Tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="agendas")
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority.value if self.priority else None,
            "status": self.status.value if self.status else None,
            "agenda_type": self.agenda_type.value if self.agenda_type else None,
            "scheduled_date": self.scheduled_date.isoformat() if self.scheduled_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "estimated_duration": self.estimated_duration,
            "user_id": self.user_id,
            "created_by_ai": self.created_by_ai,
            "ai_reasoning": self.ai_reasoning,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
