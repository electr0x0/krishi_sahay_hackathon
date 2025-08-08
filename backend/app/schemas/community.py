from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MemberRole(str, Enum):
    LEADER = "leader"
    CO_LEADER = "co-leader"
    ELDER = "elder"
    MEMBER = "member"

class HelpCategory(str, Enum):
    EQUIPMENT = "equipment"
    LABOR = "labor"
    KNOWLEDGE = "knowledge"
    FINANCIAL = "financial"
    OTHER = "other"

class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class HelpStatus(str, Enum):
    OPEN = "open"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventType(str, Enum):
    TRAINING = "training"
    CHARITY = "charity"
    CULTURAL = "cultural"
    MEETING = "meeting"
    CELEBRATION = "celebration"

class TransactionType(str, Enum):
    FUND_RAISE = "fund_raise"
    LOAN_GIVEN = "loan_given"
    LOAN_RETURNED = "loan_returned"
    INVESTMENT_RECEIVED = "investment_received"
    INVESTMENT_RETURNED = "investment_returned"
    COMMISSION_EARNED = "commission_earned"
    EXPENSE = "expense"

class LoanStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    DEFAULTED = "defaulted"

class InvestmentStatus(str, Enum):
    ACTIVE = "active"
    MATURED = "matured"
    WITHDRAWN = "withdrawn"

# Base schemas
class CommunityBase(BaseModel):
    name: str = Field(..., description="Community name")
    description: str = Field(..., description="Community description")
    location: str = Field(..., description="Community location")
    area: Optional[str] = Field(None, description="Community area")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")
    is_public: bool = Field(True, description="Is community public")
    image_url: Optional[str] = Field(None, description="Community image URL")

class CommunityMemberBase(BaseModel):
    role: MemberRole = Field(MemberRole.MEMBER, description="Member role")
    contribution_points: int = Field(0, description="Contribution points")

class HelpRequestBase(BaseModel):
    title: str = Field(..., description="Help request title")
    description: str = Field(..., description="Help request description")
    category: HelpCategory = Field(..., description="Help category")
    urgency: UrgencyLevel = Field(UrgencyLevel.MEDIUM, description="Urgency level")
    location: str = Field(..., description="Location")
    is_paid: bool = Field(False, description="Is paid help")
    amount: Optional[int] = Field(None, description="Amount in BDT")
    tags: Optional[List[str]] = Field(None, description="Tags")

class CommunityEventBase(BaseModel):
    title: str = Field(..., description="Event title")
    description: str = Field(..., description="Event description")
    type: EventType = Field(..., description="Event type")
    location: str = Field(..., description="Event location")
    event_date: datetime = Field(..., description="Event date")
    event_time: Optional[str] = Field(None, description="Event time")
    max_attendees: Optional[int] = Field(None, description="Maximum attendees")
    is_free: bool = Field(True, description="Is free event")
    fee: Optional[int] = Field(None, description="Event fee")
    fund_cost: Optional[float] = Field(0.0, description="Cost to community fund")
    expected_return: Optional[float] = Field(0.0, description="Expected return to community fund")
    image_url: Optional[str] = Field(None, description="Event image URL")

# Create schemas
class CommunityCreate(CommunityBase):
    pass

class CommunityMemberCreate(CommunityMemberBase):
    community_id: int = Field(..., description="Community ID")
    user_id: int = Field(..., description="User ID")

class HelpRequestCreate(HelpRequestBase):
    community_id: int = Field(..., description="Community ID")

class CommunityEventCreate(CommunityEventBase):
    community_id: int = Field(..., description="Community ID")

# Update schemas
class CommunityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_public: Optional[bool] = None
    image_url: Optional[str] = None

class CommunityMemberUpdate(BaseModel):
    role: Optional[MemberRole] = None
    contribution_points: Optional[int] = None
    is_active: Optional[bool] = None

class HelpRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[HelpCategory] = None
    urgency: Optional[UrgencyLevel] = None
    location: Optional[str] = None
    is_paid: Optional[bool] = None
    amount: Optional[int] = None
    status: Optional[HelpStatus] = None
    accepted_by_id: Optional[int] = None
    tags: Optional[List[str]] = None

class CommunityEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[EventType] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    event_time: Optional[str] = None
    max_attendees: Optional[int] = None
    is_free: Optional[bool] = None
    fee: Optional[int] = None
    image_url: Optional[str] = None

# Response schemas
class CommunityMemberResponse(BaseModel):
    id: int
    user_id: int
    role: MemberRole
    join_date: datetime
    contribution_points: int
    is_active: bool
    user: Dict[str, Any]  # User info

    class Config:
        from_attributes = True

class HelpRequestResponse(BaseModel):
    id: int
    community_id: int
    requester_id: int
    accepted_by_id: Optional[int]
    title: str
    description: str
    category: HelpCategory
    urgency: UrgencyLevel
    location: str
    is_paid: bool
    amount: Optional[int]
    status: HelpStatus
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: Optional[datetime]
    requester: Dict[str, Any]
    accepted_by: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

class CommunityEventResponse(BaseModel):
    id: int
    community_id: int
    organizer_id: int
    title: str
    description: str
    type: EventType
    location: str
    event_date: datetime
    event_time: Optional[str]
    max_attendees: Optional[int]
    is_free: bool
    fee: Optional[int]
    image_url: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    organizer: Dict[str, Any]
    attendee_count: int

    class Config:
        from_attributes = True

class CommunityResponse(BaseModel):
    id: int
    name: str
    description: str
    location: str
    area: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    is_public: bool
    image_url: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    total_members: int
    age_in_days: int
    leader: Optional[CommunityMemberResponse]
    co_leaders: List[CommunityMemberResponse]
    elders: List[CommunityMemberResponse]
    members: List[CommunityMemberResponse]
    help_requests: List[HelpRequestResponse]
    events: List[CommunityEventResponse]

    class Config:
        from_attributes = True

# List response schemas
class CommunityListResponse(BaseModel):
    communities: List[CommunityResponse]
    total: int
    page: int
    size: int

class HelpRequestListResponse(BaseModel):
    help_requests: List[HelpRequestResponse]
    total: int
    page: int
    size: int

class CommunityEventListResponse(BaseModel):
    events: List[CommunityEventResponse]
    total: int
    page: int
    size: int

# Distance calculation response
class CommunityWithDistance(CommunityResponse):
    distance: Optional[float] = Field(None, description="Distance in kilometers")

# Join community request
class JoinCommunityRequest(BaseModel):
    community_id: int = Field(..., description="Community ID to join")

# Accept help request
class AcceptHelpRequestRequest(BaseModel):
    help_request_id: int = Field(..., description="Help request ID to accept")

# Join event request
class JoinEventRequest(BaseModel):
    event_id: int = Field(..., description="Event ID to join")

# Community Chat Schemas
class ChatMessageCreate(BaseModel):
    content: str = Field(..., description="Message content")
    message_type: str = Field("text", description="Message type: text, help_request, event, system")
    metadata: Optional[dict] = Field(None, description="Additional metadata for help requests or events")

class ChatMessageResponse(BaseModel):
    id: int
    community_id: int
    user_id: int
    message_type: str
    content: str
    metadata: Optional[dict]
    created_at: datetime
    user: Dict[str, Any]  # User info
    
    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]
    total: int
    page: int
    size: int

class CommunityJoinRequestCreate(BaseModel):
    community_id: int = Field(..., description="Community ID to request to join")

class CommunityJoinRequestResponse(BaseModel):
    id: int
    community_id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Fund Management Schemas
class CommunityFundResponse(BaseModel):
    id: int
    community_id: int
    current_balance: float
    total_raised: float
    total_loans: float
    total_investments: float
    commission_rate: float
    fixed_return_rate: float
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class UpdateReturnRateRequest(BaseModel):
    return_rate: float = Field(..., ge=0, le=1, description="Annual return rate (0-1)")

class RecordEventReturnRequest(BaseModel):
    event_id: int = Field(..., description="Event ID")
    actual_return: float = Field(..., ge=0, description="Actual return amount")

class FundTransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount")
    description: Optional[str] = Field(None, description="Transaction description")

class FundTransactionResponse(BaseModel):
    id: int
    community_id: int
    user_id: Optional[int]
    transaction_type: TransactionType
    amount: float
    description: Optional[str]
    reference_id: Optional[int]
    reference_type: Optional[str]
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class LoanCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Loan amount")
    purpose: str = Field(..., description="Purpose of the loan")
    due_date: datetime = Field(..., description="Due date for loan return")
    notes: Optional[str] = Field(None, description="Additional notes")

class LoanResponse(BaseModel):
    id: int
    community_id: int
    borrower_id: int
    amount: float
    purpose: str
    status: LoanStatus
    loan_date: datetime
    due_date: datetime
    returned_date: Optional[datetime]
    returned_amount: float
    notes: Optional[str]
    borrower_name: str
    is_overdue: bool = False

    class Config:
        from_attributes = True

class LoanReturn(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to return")
    notes: Optional[str] = Field(None, description="Return notes")

class InvestmentCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Investment amount")
    maturity_months: int = Field(..., gt=0, description="Investment duration in months")
    notes: Optional[str] = Field(None, description="Investment notes")

class InvestmentResponse(BaseModel):
    id: int
    community_id: int
    investor_id: int
    amount: float
    profit_rate: float
    status: InvestmentStatus
    investment_date: datetime
    maturity_date: datetime
    withdrawn_date: Optional[datetime]
    total_earned: float
    notes: Optional[str]
    investor_name: str
    current_value: float = 0.0

    class Config:
        from_attributes = True

class InvestmentWithdraw(BaseModel):
    notes: Optional[str] = Field(None, description="Withdrawal notes")

class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Donation amount")
    description: Optional[str] = Field(None, description="Donation description")