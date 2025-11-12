from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class AdminRoleEnum(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MODERATOR = "moderator"
    SUPPORT = "support"


class TicketStatusEnum(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# Admin User Schemas
class AdminUserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: AdminRoleEnum = AdminRoleEnum.SUPPORT


class AdminUserCreate(AdminUserBase):
    password: str = Field(..., min_length=8)


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[AdminRoleEnum] = None
    is_active: Optional[bool] = None


class AdminUserResponse(AdminUserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminUserResponse


# Activity Log Schemas
class ActivityLogCreate(BaseModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None


class ActivityLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
    admin_email: Optional[str] = None
    
    class Config:
        from_attributes = True


# Support Ticket Schemas
class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    category: Optional[str] = None
    priority: TicketPriorityEnum = TicketPriorityEnum.MEDIUM


class SupportTicketUpdate(BaseModel):
    status: Optional[TicketStatusEnum] = None
    priority: Optional[TicketPriorityEnum] = None
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None


class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    description: str
    status: TicketStatusEnum
    priority: TicketPriorityEnum
    assigned_to: Optional[int] = None
    category: Optional[str] = None
    resolution: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Dashboard Metrics Schemas
class DashboardMetrics(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    total_sensors: int
    online_sensors: int
    sensor_uptime_percent: float
    detections_today: int
    detections_this_week: int
    open_tickets: int
    monthly_revenue: float
    pending_moderation: int
    timestamp: datetime


class UserGrowthData(BaseModel):
    date: str
    new_users: int
    total_users: int


class DiseaseStatistic(BaseModel):
    disease_name: str
    count: int
    percentage: float


class SensorStatistic(BaseModel):
    sensor_id: str
    location: Optional[str] = None
    status: str
    last_reading: Optional[datetime] = None
    battery_level: Optional[float] = None


# User Management Schemas
class UserListItem(BaseModel):
    id: int
    username: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    farm_count: int = 0
    sensor_count: int = 0
    
    class Config:
        from_attributes = True


class UserDetailResponse(UserListItem):
    total_detections: int = 0
    total_marketplace_transactions: int = 0
    community_posts: int = 0
    subscription_status: Optional[str] = None


class UserActionRequest(BaseModel):
    action: str = Field(..., description="Action to perform: suspend, activate, verify, delete")
    reason: Optional[str] = None


# Analytics Schemas
class AnalyticsTimeRange(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"


class AnalyticsRequest(BaseModel):
    time_range: AnalyticsTimeRange = AnalyticsTimeRange.MONTH
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class PlatformHealthMetrics(BaseModel):
    api_uptime_percent: float
    avg_response_time_ms: float
    error_rate_percent: float
    active_websocket_connections: int
    database_size_mb: float
    timestamp: datetime
