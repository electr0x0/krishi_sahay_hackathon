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

class TransactionType(enum.Enum):
    FUND_RAISE = "fund_raise"  # From events or donations
    LOAN_GIVEN = "loan_given"  # Money lent to farmers
    LOAN_RETURNED = "loan_returned"  # Money returned by farmers
    INVESTMENT_RECEIVED = "investment_received"  # Investment from farmers
    INVESTMENT_RETURNED = "investment_returned"  # Investment returned with profit
    COMMISSION_EARNED = "commission_earned"  # Commission from sales
    EXPENSE = "expense"  # Community expenses

class LoanStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    DEFAULTED = "defaulted"

class InvestmentStatus(enum.Enum):
    ACTIVE = "active"
    MATURED = "matured"
    WITHDRAWN = "withdrawn"

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
    fund = relationship("CommunityFund", back_populates="community", uselist=False)
    fund_transactions = relationship("FundTransaction", back_populates="community")
    loans = relationship("CommunityLoan", back_populates="community")
    investments = relationship("CommunityInvestment", back_populates="community")

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
    fund_cost = Column(Float, default=0.0)  # Cost to community fund
    expected_return = Column(Float, default=0.0)  # Expected return to community fund
    actual_return = Column(Float, default=0.0)  # Actual return received
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

class CommunityJoinRequest(Base):
    __tablename__ = "community_join_requests"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    community = relationship("Community")
    user = relationship("User")

class CommunityFund(Base):
    __tablename__ = "community_funds"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False, unique=True)
    current_balance = Column(Float, default=0.0)  # Current available funds
    total_raised = Column(Float, default=0.0)  # Total ever raised
    total_loans = Column(Float, default=0.0)  # Total currently on loan
    total_investments = Column(Float, default=0.0)  # Total currently invested
    commission_rate = Column(Float, default=0.05)  # 5% commission on sales
    fixed_return_rate = Column(Float, default=0.10)  # 10% fixed annual return rate set by leaders
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    community = relationship("Community", back_populates="fund")

class FundTransaction(Base):
    __tablename__ = "fund_transactions"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for system transactions
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    reference_id = Column(Integer, nullable=True)  # ID of related loan/investment/sale
    reference_type = Column(String(50), nullable=True)  # loan, investment, sale, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    community = relationship("Community", back_populates="fund_transactions")
    user = relationship("User")

class CommunityLoan(Base):
    __tablename__ = "community_loans"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    borrower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    purpose = Column(Text, nullable=False)
    status = Column(Enum(LoanStatus), default=LoanStatus.ACTIVE)
    loan_date = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=False)
    returned_date = Column(DateTime(timezone=True), nullable=True)
    returned_amount = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    
    # Relationships
    community = relationship("Community", back_populates="loans")
    borrower = relationship("User")

class CommunityInvestment(Base):
    __tablename__ = "community_investments"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    investor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    profit_rate = Column(Float, nullable=False)  # Annual profit rate (e.g., 0.10 for 10%)
    status = Column(Enum(InvestmentStatus), default=InvestmentStatus.ACTIVE)
    investment_date = Column(DateTime(timezone=True), server_default=func.now())
    maturity_date = Column(DateTime(timezone=True), nullable=False)
    withdrawn_date = Column(DateTime(timezone=True), nullable=True)
    total_earned = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    
    # Relationships
    community = relationship("Community", back_populates="investments")
    investor = relationship("User")