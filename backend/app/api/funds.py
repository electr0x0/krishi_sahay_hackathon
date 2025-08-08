from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import (
    User, Community, CommunityMember, CommunityFund, FundTransaction, 
    CommunityLoan, CommunityInvestment, TransactionType, LoanStatus, 
    InvestmentStatus, MemberRole
)
from app.schemas.community import (
    CommunityFundResponse, FundTransactionCreate, FundTransactionResponse,
    LoanCreate, LoanResponse, LoanReturn, InvestmentCreate, InvestmentResponse,
    InvestmentWithdraw, DonationCreate, UpdateReturnRateRequest, RecordEventReturnRequest
)

router = APIRouter()

def get_or_create_community_fund(db: Session, community_id: int) -> CommunityFund:
    """Get or create community fund"""
    fund = db.query(CommunityFund).filter(CommunityFund.community_id == community_id).first()
    if not fund:
        fund = CommunityFund(community_id=community_id)
        db.add(fund)
        db.commit()
        db.refresh(fund)
    return fund

def verify_community_member(db: Session, user: User, community_id: int) -> CommunityMember:
    """Verify user is a member of the community"""
    member = db.query(CommunityMember).filter(
        and_(CommunityMember.community_id == community_id,
             CommunityMember.user_id == user.id,
             CommunityMember.is_active == True)
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this community"
        )
    return member

def verify_community_leader(db: Session, user: User, community_id: int) -> CommunityMember:
    """Verify user is a leader or co-leader of the community"""
    member = verify_community_member(db, user, community_id)
    if member.role not in [MemberRole.LEADER, MemberRole.CO_LEADER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only leaders and co-leaders can manage funds"
        )
    return member

def create_fund_transaction(
    db: Session, 
    community_id: int, 
    user_id: Optional[int], 
    transaction_type: TransactionType,
    amount: float,
    description: Optional[str] = None,
    reference_id: Optional[int] = None,
    reference_type: Optional[str] = None
) -> FundTransaction:
    """Create a fund transaction and update fund balance"""
    transaction = FundTransaction(
        community_id=community_id,
        user_id=user_id,
        transaction_type=transaction_type,
        amount=amount,
        description=description,
        reference_id=reference_id,
        reference_type=reference_type
    )
    db.add(transaction)
    
    # Update fund balance
    fund = get_or_create_community_fund(db, community_id)
    
    if transaction_type in [TransactionType.FUND_RAISE, TransactionType.LOAN_RETURNED, 
                          TransactionType.COMMISSION_EARNED, TransactionType.INVESTMENT_RECEIVED]:
        fund.current_balance += amount
        if transaction_type == TransactionType.FUND_RAISE:
            fund.total_raised += amount
        elif transaction_type == TransactionType.LOAN_RETURNED:
            fund.total_loans -= amount
        elif transaction_type == TransactionType.INVESTMENT_RECEIVED:
            fund.total_investments += amount
            
    elif transaction_type in [TransactionType.LOAN_GIVEN, TransactionType.INVESTMENT_RETURNED, 
                            TransactionType.EXPENSE]:
        fund.current_balance -= amount
        if transaction_type == TransactionType.LOAN_GIVEN:
            fund.total_loans += amount
        elif transaction_type == TransactionType.INVESTMENT_RETURNED:
            fund.total_investments -= amount
    
    db.commit()
    db.refresh(transaction)
    return transaction

@router.get("/communities/{community_id}/fund", response_model=CommunityFundResponse)
def get_community_fund(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get community fund information"""
    verify_community_member(db, current_user, community_id)
    fund = get_or_create_community_fund(db, community_id)
    return fund

@router.get("/communities/{community_id}/fund/transactions", response_model=List[FundTransactionResponse])
def get_fund_transactions(
    community_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get fund transaction history"""
    verify_community_member(db, current_user, community_id)
    
    transactions = db.query(FundTransaction).filter(
        FundTransaction.community_id == community_id
    ).order_by(desc(FundTransaction.created_at)).offset(offset).limit(limit).all()
    
    # Add user names to transactions
    result = []
    for transaction in transactions:
        transaction_dict = transaction.__dict__.copy()
        if transaction.user_id:
            user = db.query(User).filter(User.id == transaction.user_id).first()
            transaction_dict['user_name'] = user.full_name if user else None
        else:
            transaction_dict['user_name'] = None
        result.append(FundTransactionResponse(**transaction_dict))
    
    return result

@router.post("/communities/{community_id}/fund/donate", response_model=FundTransactionResponse)
def donate_to_fund(
    community_id: int,
    donation: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Donate money to community fund"""
    verify_community_member(db, current_user, community_id)
    
    transaction = create_fund_transaction(
        db=db,
        community_id=community_id,
        user_id=current_user.id,
        transaction_type=TransactionType.FUND_RAISE,
        amount=donation.amount,
        description=donation.description or f"Donation by {current_user.full_name}"
    )
    
    # Add user name for response
    result = transaction.__dict__.copy()
    result['user_name'] = current_user.full_name
    return FundTransactionResponse(**result)

@router.post("/communities/{community_id}/fund/set-return-rate", response_model=CommunityFundResponse)
def set_return_rate(
    community_id: int,
    rate_request: UpdateReturnRateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set fixed return rate for investments (leaders only)"""
    verify_community_leader(db, current_user, community_id)
    
    fund = get_or_create_community_fund(db, community_id)
    fund.fixed_return_rate = rate_request.return_rate
    
    db.commit()
    db.refresh(fund)
    return fund

@router.post("/communities/{community_id}/fund/record-event-return", response_model=FundTransactionResponse)
def record_event_return(
    community_id: int,
    return_request: RecordEventReturnRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record actual return from an event (leaders only)"""
    verify_community_leader(db, current_user, community_id)
    
    # Update event actual return
    from app.models.community import CommunityEvent
    event = db.query(CommunityEvent).filter(
        and_(CommunityEvent.id == return_request.event_id,
             CommunityEvent.community_id == community_id)
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event.actual_return = return_request.actual_return
    
    # Create fund transaction if there's actual return
    if return_request.actual_return > 0:
        transaction = create_fund_transaction(
            db=db,
            community_id=community_id,
            user_id=current_user.id,
            transaction_type=TransactionType.FUND_RAISE,
            amount=return_request.actual_return,
            description=f"Return from event: {event.title}",
            reference_id=event.id,
            reference_type="event"
        )
        
        result = transaction.__dict__.copy()
        result['user_name'] = current_user.full_name
        return FundTransactionResponse(**result)
    
    db.commit()
    return {"message": "Event return recorded successfully"}

@router.post("/communities/{community_id}/loans/apply", response_model=LoanResponse)
def apply_for_loan(
    community_id: int,
    loan_request: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Apply for a loan from community fund"""
    verify_community_member(db, current_user, community_id)
    
    fund = get_or_create_community_fund(db, community_id)
    if fund.current_balance < loan_request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds in community fund"
        )
    
    # Check if user has any active loans
    active_loan = db.query(CommunityLoan).filter(
        and_(CommunityLoan.community_id == community_id,
             CommunityLoan.borrower_id == current_user.id,
             CommunityLoan.status == LoanStatus.ACTIVE)
    ).first()
    
    if active_loan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active loan in this community"
        )
    
    # Create loan
    loan = CommunityLoan(
        community_id=community_id,
        borrower_id=current_user.id,
        amount=loan_request.amount,
        purpose=loan_request.purpose,
        due_date=loan_request.due_date,
        notes=loan_request.notes
    )
    db.add(loan)
    db.flush()
    
    # Create transaction
    create_fund_transaction(
        db=db,
        community_id=community_id,
        user_id=current_user.id,
        transaction_type=TransactionType.LOAN_GIVEN,
        amount=loan_request.amount,
        description=f"Loan given to {current_user.full_name}: {loan_request.purpose}",
        reference_id=loan.id,
        reference_type="loan"
    )
    
    db.commit()
    db.refresh(loan)
    
    # Prepare response
    result = loan.__dict__.copy()
    result['borrower_name'] = current_user.full_name
    result['is_overdue'] = loan.due_date < datetime.now(timezone.utc) and loan.status == LoanStatus.ACTIVE
    return LoanResponse(**result)

@router.get("/communities/{community_id}/loans", response_model=List[LoanResponse])
def get_community_loans(
    community_id: int,
    status_filter: Optional[LoanStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get community loans (leaders can see all, members can see only their own)"""
    member = verify_community_member(db, current_user, community_id)
    
    query = db.query(CommunityLoan).filter(CommunityLoan.community_id == community_id)
    
    # Non-leaders can only see their own loans
    if member.role not in [MemberRole.LEADER, MemberRole.CO_LEADER]:
        query = query.filter(CommunityLoan.borrower_id == current_user.id)
    
    if status_filter:
        query = query.filter(CommunityLoan.status == status_filter)
    
    loans = query.order_by(desc(CommunityLoan.loan_date)).all()
    
    # Prepare response with borrower names and overdue status
    result = []
    for loan in loans:
        loan_dict = loan.__dict__.copy()
        borrower = db.query(User).filter(User.id == loan.borrower_id).first()
        loan_dict['borrower_name'] = borrower.full_name if borrower else "Unknown"
        loan_dict['is_overdue'] = loan.due_date < datetime.now(timezone.utc) and loan.status == LoanStatus.ACTIVE
        result.append(LoanResponse(**loan_dict))
    
    return result

@router.post("/communities/{community_id}/loans/{loan_id}/return", response_model=LoanResponse)
def return_loan(
    community_id: int,
    loan_id: int,
    loan_return: LoanReturn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return money for a loan"""
    verify_community_member(db, current_user, community_id)
    
    loan = db.query(CommunityLoan).filter(
        and_(CommunityLoan.id == loan_id,
             CommunityLoan.community_id == community_id,
             CommunityLoan.borrower_id == current_user.id,
             CommunityLoan.status == LoanStatus.ACTIVE)
    ).first()
    
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found or not accessible"
        )
    
    remaining_amount = loan.amount - loan.returned_amount
    if loan_return.amount > remaining_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Return amount cannot exceed remaining loan amount of {remaining_amount}"
        )
    
    # Update loan
    loan.returned_amount += loan_return.amount
    if loan.returned_amount >= loan.amount:
        loan.status = LoanStatus.COMPLETED
        loan.returned_date = datetime.now(timezone.utc)
    if loan_return.notes:
        loan.notes = f"{loan.notes}\n{loan_return.notes}" if loan.notes else loan_return.notes
    
    # Create transaction
    create_fund_transaction(
        db=db,
        community_id=community_id,
        user_id=current_user.id,
        transaction_type=TransactionType.LOAN_RETURNED,
        amount=loan_return.amount,
        description=f"Loan return by {current_user.full_name}",
        reference_id=loan.id,
        reference_type="loan"
    )
    
    db.commit()
    db.refresh(loan)
    
    result = loan.__dict__.copy()
    result['borrower_name'] = current_user.full_name
    result['is_overdue'] = loan.due_date < datetime.now(timezone.utc) and loan.status == LoanStatus.ACTIVE
    return LoanResponse(**result)

@router.post("/communities/{community_id}/investments/create", response_model=InvestmentResponse)
def create_investment(
    community_id: int,
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invest money in community fund"""
    verify_community_member(db, current_user, community_id)
    
    # Get community fund to use fixed return rate
    fund = get_or_create_community_fund(db, community_id)
    
    # Calculate maturity date
    maturity_date = datetime.now(timezone.utc) + relativedelta(months=investment.maturity_months)
    
    # Create investment using fixed return rate
    db_investment = CommunityInvestment(
        community_id=community_id,
        investor_id=current_user.id,
        amount=investment.amount,
        profit_rate=fund.fixed_return_rate,  # Use community's fixed return rate
        maturity_date=maturity_date,
        notes=investment.notes
    )
    db.add(db_investment)
    db.flush()
    
    # Create transaction
    create_fund_transaction(
        db=db,
        community_id=community_id,
        user_id=current_user.id,
        transaction_type=TransactionType.INVESTMENT_RECEIVED,
        amount=investment.amount,
        description=f"Investment by {current_user.full_name}",
        reference_id=db_investment.id,
        reference_type="investment"
    )
    
    db.commit()
    db.refresh(db_investment)
    
    # Calculate current value
    months_passed = (datetime.now(timezone.utc) - db_investment.investment_date).days / 30.44
    current_value = db_investment.amount * (1 + db_investment.profit_rate * (months_passed / 12))
    
    result = db_investment.__dict__.copy()
    result['investor_name'] = current_user.full_name
    result['current_value'] = current_value
    return InvestmentResponse(**result)

@router.get("/communities/{community_id}/investments", response_model=List[InvestmentResponse])
def get_community_investments(
    community_id: int,
    status_filter: Optional[InvestmentStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get community investments (leaders can see all, members can see only their own)"""
    member = verify_community_member(db, current_user, community_id)
    
    query = db.query(CommunityInvestment).filter(CommunityInvestment.community_id == community_id)
    
    # Non-leaders can only see their own investments
    if member.role not in [MemberRole.LEADER, MemberRole.CO_LEADER]:
        query = query.filter(CommunityInvestment.investor_id == current_user.id)
    
    if status_filter:
        query = query.filter(CommunityInvestment.status == status_filter)
    
    investments = query.order_by(desc(CommunityInvestment.investment_date)).all()
    
    # Prepare response with investor names and current values
    result = []
    for investment in investments:
        investment_dict = investment.__dict__.copy()
        investor = db.query(User).filter(User.id == investment.investor_id).first()
        investment_dict['investor_name'] = investor.full_name if investor else "Unknown"
        
        # Calculate current value
        if investment.status == InvestmentStatus.ACTIVE:
            months_passed = (datetime.now(timezone.utc) - investment.investment_date).days / 30.44
            current_value = investment.amount * (1 + investment.profit_rate * (months_passed / 12))
        else:
            current_value = investment.total_earned
            
        investment_dict['current_value'] = current_value
        result.append(InvestmentResponse(**investment_dict))
    
    return result

@router.post("/communities/{community_id}/investments/{investment_id}/withdraw", response_model=InvestmentResponse)
def withdraw_investment(
    community_id: int,
    investment_id: int,
    withdrawal: InvestmentWithdraw,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Withdraw investment (only if matured)"""
    verify_community_member(db, current_user, community_id)
    
    investment = db.query(CommunityInvestment).filter(
        and_(CommunityInvestment.id == investment_id,
             CommunityInvestment.community_id == community_id,
             CommunityInvestment.investor_id == current_user.id,
             CommunityInvestment.status == InvestmentStatus.ACTIVE)
    ).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found or not accessible"
        )
    
    if investment.maturity_date > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Investment has not yet matured"
        )
    
    # Calculate total return
    months_invested = (datetime.now(timezone.utc) - investment.investment_date).days / 30.44
    total_earned = investment.amount * (1 + investment.profit_rate * (months_invested / 12))
    
    # Check if community has enough funds
    fund = get_or_create_community_fund(db, community_id)
    if fund.current_balance < total_earned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds in community to pay investment return"
        )
    
    # Update investment
    investment.status = InvestmentStatus.WITHDRAWN
    investment.withdrawn_date = datetime.now(timezone.utc)
    investment.total_earned = total_earned
    if withdrawal.notes:
        investment.notes = f"{investment.notes}\n{withdrawal.notes}" if investment.notes else withdrawal.notes
    
    # Create transaction
    create_fund_transaction(
        db=db,
        community_id=community_id,
        user_id=current_user.id,
        transaction_type=TransactionType.INVESTMENT_RETURNED,
        amount=total_earned,
        description=f"Investment withdrawal by {current_user.full_name}",
        reference_id=investment.id,
        reference_type="investment"
    )
    
    db.commit()
    db.refresh(investment)
    
    result = investment.__dict__.copy()
    result['investor_name'] = current_user.full_name
    result['current_value'] = total_earned
    return InvestmentResponse(**result)
