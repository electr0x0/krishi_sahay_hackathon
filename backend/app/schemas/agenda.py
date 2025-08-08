from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AgendaPrioritySchema(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class AgendaStatusSchema(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AgendaTypeSchema(str, Enum):
    USER_CREATED = "user_created"
    AI_SUGGESTED = "ai_suggested"
    WEATHER_ALERT = "weather_alert"
    SENSOR_ALERT = "sensor_alert"
    MAINTENANCE = "maintenance"
    HARVESTING = "harvesting"
    PLANTING = "planting"
    IRRIGATION = "irrigation"
    FERTILIZATION = "fertilization"


class AgendaBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: AgendaPrioritySchema = AgendaPrioritySchema.MEDIUM
    agenda_type: AgendaTypeSchema = AgendaTypeSchema.USER_CREATED
    scheduled_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = Field(None, ge=1, description="Duration in minutes")


class AgendaCreate(AgendaBase):
    pass


class AgendaUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[AgendaPrioritySchema] = None
    status: Optional[AgendaStatusSchema] = None
    scheduled_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = Field(None, ge=1)


class AgendaResponse(AgendaBase):
    id: int
    status: AgendaStatusSchema
    user_id: int
    created_by_ai: bool
    ai_reasoning: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgendaListResponse(BaseModel):
    agendas: List[AgendaResponse]
    total: int
    pending: int
    completed: int
    ai_suggested: int


class AIAgendaRequest(BaseModel):
    user_context: Optional[dict] = None
    force_refresh: bool = False
    max_suggestions: int = Field(default=5, ge=1, le=10)


class AIAgendaResponse(BaseModel):
    suggestions: List[AgendaResponse]
    reasoning: str
    source_data_summary: str
    generated_at: datetime
