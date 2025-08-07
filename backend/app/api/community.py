from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional
import json
from datetime import datetime, timedelta
import math

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import (
    Community, CommunityMember, HelpRequest, CommunityEvent, EventAttendee,
    User, MemberRole, HelpCategory, UrgencyLevel, HelpStatus, EventType,
    CommunityMessage, CommunityMessageType
)
from app.schemas.community import (
    CommunityCreate, CommunityUpdate, CommunityResponse, CommunityListResponse,
    CommunityMemberCreate, CommunityMemberUpdate, CommunityMemberResponse,
    HelpRequestCreate, HelpRequestUpdate, HelpRequestResponse, HelpRequestListResponse,
    CommunityEventCreate, CommunityEventUpdate, CommunityEventResponse, CommunityEventListResponse,
    JoinCommunityRequest, AcceptHelpRequestRequest, JoinEventRequest,
    CommunityWithDistance, ChatMessageCreate, ChatMessageResponse, ChatHistoryResponse
)

# The router is defined without a prefix, as the prefix should be
# handled when including the router in your main app.
router = APIRouter(tags=["community"])


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def get_user_location(db: Session, user_id: int) -> tuple[Optional[float], Optional[float]]:
    """Get user's location coordinates"""
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.latitude and user.longitude:
        return user.latitude, user.longitude
    return None, None

# --- Route Order Explanation ---
# FastAPI matches routes in the order they are defined.
# 1. Specific static routes must come first (e.g., "/nearby", "/join").
# 2. Routes for sub-resources come next (e.g., "/events", "/help-requests").
# 3. Generic dynamic routes with path variables (e.g., "/{community_id}") must come LAST.

# --- Community Endpoints (Specific/Static Routes First) ---

@router.post("/", response_model=CommunityResponse)
def create_community(
    community_data: CommunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new community"""
    existing_leader = db.query(CommunityMember).filter(
        and_(
            CommunityMember.user_id == current_user.id,
            CommunityMember.role == MemberRole.LEADER,
            CommunityMember.is_active == True
        )
    ).first()
    
    if existing_leader:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only be a leader of one community at a time"
        )
    
    db_community = Community(**community_data.dict())
    db.add(db_community)
    db.commit()
    db.refresh(db_community)
    
    leader_member = CommunityMember(
        community_id=db_community.id,
        user_id=current_user.id,
        role=MemberRole.LEADER
    )
    db.add(leader_member)
    db.commit()
    
    return get_community_response(db_community, db)

@router.get("/", response_model=CommunityListResponse)
def get_communities(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get communities with optional filtering"""
    query = db.query(Community).filter(Community.is_public == True)
    
    if search:
        query = query.filter(
            or_(
                Community.name.ilike(f"%{search}%"),
                Community.description.ilike(f"%{search}%")
            )
        )
    
    if location:
        query = query.filter(Community.location == location)
    
    total = query.count()
    communities = query.offset((page - 1) * size).limit(size).all()
    
    user_lat, user_lon = get_user_location(db, current_user.id)
    
    community_responses = []
    for community in communities:
        response = get_community_response(community, db)
        
        if user_lat and user_lon and community.latitude and community.longitude:
            distance = calculate_distance(user_lat, user_lon, community.latitude, community.longitude)
            # Assuming CommunityResponse can hold a distance attribute
            # If not, you'd use the CommunityWithDistance schema
            if hasattr(response, 'distance'):
                 response.distance = distance
        
        community_responses.append(response)
    
    return CommunityListResponse(
        communities=community_responses,
        total=total,
        page=page,
        size=size
    )

@router.get("/nearby", response_model=List[CommunityWithDistance])
def get_all_communities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all public communities"""
    # Get all public communities
    communities = db.query(Community).filter(Community.is_public == True).all()
    
    all_communities = []
    for community in communities:
        community_data = get_community_response(community, db).dict()
        # Set default distance - this will be used for sorting if needed
        distance = 25.0  # Default distance for all communities
        community_with_distance = CommunityWithDistance(**community_data, distance=distance)
        all_communities.append(community_with_distance)
    
    # Sort by creation date (newest first) or by name
    all_communities.sort(key=lambda x: x.name)
    
    return all_communities

# === HELP REQUEST & EVENT ACTIONS ===

@router.post("/{community_id}/help/{message_id}/accept")
def accept_help_request(
    community_id: int,
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a help request"""
    # Check if user is a member of the community
    membership = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this community"
        )
    
    # Get the help request message
    message = db.query(CommunityMessage).filter(
        and_(
            CommunityMessage.id == message_id,
            CommunityMessage.community_id == community_id,
            CommunityMessage.message_type == CommunityMessageType.HELP_REQUEST
        )
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Help request not found")
    
    # Check if user is trying to help themselves
    if message.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot accept your own help request")
    
    # Check if already accepted
    if message.message_metadata and message.message_metadata.get('accepted_by'):
        raise HTTPException(status_code=400, detail="Help request already accepted")
    
    # Update metadata to mark as accepted
    if not message.message_metadata:
        message.message_metadata = {}
    
    message.message_metadata['accepted_by'] = current_user.id
    message.message_metadata['accepted_by_name'] = current_user.full_name
    message.message_metadata['accepted_at'] = datetime.utcnow().isoformat()
    message.message_metadata['status'] = 'accepted'
    
    db.commit()
    
    return {"message": "Help request accepted successfully"}

@router.post("/{community_id}/help/{message_id}/complete")
def complete_help_request(
    community_id: int,
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete a help request (pay if needed)"""
    # Get the help request message
    message = db.query(CommunityMessage).filter(
        and_(
            CommunityMessage.id == message_id,
            CommunityMessage.community_id == community_id,
            CommunityMessage.message_type == CommunityMessageType.HELP_REQUEST
        )
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Help request not found")
    
    # Check if user is the one who accepted it or the original requester
    if (message.message_metadata and 
        message.message_metadata.get('accepted_by') != current_user.id and 
        message.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="You can only complete help requests you accepted or requested")
    
    # Update metadata to mark as completed
    if not message.message_metadata:
        message.message_metadata = {}
    
    message.message_metadata['completed_by'] = current_user.id
    message.message_metadata['completed_at'] = datetime.utcnow().isoformat()
    message.message_metadata['status'] = 'completed'
    
    # If it's paid, mark as paid
    if message.message_metadata.get('is_paid'):
        message.message_metadata['payment_status'] = 'paid'
    
    db.commit()
    
    return {"message": "Help request completed successfully"}

@router.post("/{community_id}/event/{message_id}/pay")
def pay_for_event(
    community_id: int,
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pay for an event"""
    # Check if user is a member of the community
    membership = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this community"
        )
    
    # Get the event message
    message = db.query(CommunityMessage).filter(
        and_(
            CommunityMessage.id == message_id,
            CommunityMessage.community_id == community_id,
            CommunityMessage.message_type == CommunityMessageType.EVENT
        )
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if event requires payment
    if message.message_metadata and message.message_metadata.get('is_free', True):
        raise HTTPException(status_code=400, detail="This event is free")
    
    # Update metadata to mark as paid/attended
    if not message.message_metadata:
        message.message_metadata = {}
    
    # Initialize attendees list if it doesn't exist
    if 'attendees' not in message.message_metadata:
        message.message_metadata['attendees'] = []
    
    # Check if already paid
    attendees = message.message_metadata.get('attendees', [])
    if any(attendee.get('user_id') == current_user.id for attendee in attendees):
        raise HTTPException(status_code=400, detail="You have already paid for this event")
    
    # Add user to attendees
    attendees.append({
        'user_id': current_user.id,
        'user_name': current_user.full_name,
        'paid_at': datetime.utcnow().isoformat(),
        'payment_status': 'paid'
    })
    
    message.message_metadata['attendees'] = attendees
    
    db.commit()
    
    return {"message": "Event payment completed successfully"}



@router.post("/join")
def join_community(
    join_data: JoinCommunityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a community"""
    existing_member = db.query(CommunityMember).filter(
        and_(
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only join one community at a time"
        )
    
    community = db.query(Community).filter(Community.id == join_data.community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    if community.latitude and community.longitude:
        user_lat, user_lon = get_user_location(db, current_user.id)
        if user_lat and user_lon:
            distance = calculate_distance(user_lat, user_lon, community.latitude, community.longitude)
            if distance > 50:  # 50km limit
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Community is too far away ({distance:.1f}km). You can only join communities within 50km."
                )
    
    member = CommunityMember(
        community_id=join_data.community_id,
        user_id=current_user.id,
        role=MemberRole.MEMBER
    )
    db.add(member)
    db.commit()
    
    return {"message": "Successfully joined community"}

@router.post("/leave")
def leave_community(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Leave current community"""
    # Find user's current community membership
    membership = db.query(CommunityMember).filter(
        and_(
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not membership:
        raise HTTPException(status_code=404, detail="User is not a member of any community")
    
    community_id = membership.community_id
    
    # Count total active members in the community
    total_members = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == community_id,
            CommunityMember.is_active == True
        )
    ).count()
    
    # If this is the last member, delete the entire community
    if total_members == 1:
        # Get the community
        community = db.query(Community).filter(Community.id == community_id).first()
        
        # Delete all related data
        # Delete all community messages
        db.query(CommunityMessage).filter(CommunityMessage.community_id == community_id).delete()
        
        # Delete all help requests
        db.query(HelpRequest).filter(HelpRequest.community_id == community_id).delete()
        
        # Delete all events and their attendees
        events = db.query(CommunityEvent).filter(CommunityEvent.community_id == community_id).all()
        for event in events:
            db.query(EventAttendee).filter(EventAttendee.event_id == event.id).delete()
        db.query(CommunityEvent).filter(CommunityEvent.community_id == community_id).delete()
        
        # Delete all members (including this one)
        db.query(CommunityMember).filter(CommunityMember.community_id == community_id).delete()
        
        # Finally delete the community itself
        db.delete(community)
        db.commit()
        
        return {"message": "Successfully left community. Community has been deleted as you were the last member."}
    
    # If not the last member, check if user is a leader
    if membership.role == MemberRole.LEADER and total_members > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leaders cannot leave community while other members exist. Transfer leadership first or remove all members."
        )
    
    # Deactivate membership
    membership.is_active = False
    db.commit()
    
    return {"message": "Successfully left community"}

# --- User-specific Routes (MUST BE BEFORE PATH PARAMETER ROUTES) ---

@router.get("/user/joined", response_model=Optional[CommunityResponse])
def get_user_community(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the community that the current user has joined"""
    member = db.query(CommunityMember).filter(
        and_(
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not member:
        return None  # Return null when user hasn't joined any community
    
    community = db.query(Community).filter(Community.id == member.community_id).first()
    return get_community_response(community, db)

# --- Help Request Endpoints ---

@router.post("/help-requests", response_model=HelpRequestResponse)
def create_help_request(
    help_request_data: HelpRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a help request"""
    member = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == help_request_data.community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of the community to create help requests"
        )
    
    db_help_request = HelpRequest(
        **help_request_data.dict(),
        requester_id=member.id,
        tags=json.dumps(help_request_data.tags) if help_request_data.tags else None
    )
    db.add(db_help_request)
    db.commit()
    db.refresh(db_help_request)
    
    return get_help_request_response(db_help_request, db)

@router.get("/help-requests", response_model=HelpRequestListResponse)
def get_help_requests(
    community_id: Optional[int] = Query(None),
    category: Optional[HelpCategory] = Query(None),
    urgency: Optional[UrgencyLevel] = Query(None),
    status: Optional[HelpStatus] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get help requests with filtering"""
    query = db.query(HelpRequest)
    
    if community_id:
        query = query.filter(HelpRequest.community_id == community_id)
    
    if category:
        query = query.filter(HelpRequest.category == category)
    
    if urgency:
        query = query.filter(HelpRequest.urgency == urgency)
    
    if status:
        query = query.filter(HelpRequest.status == status)
    
    total = query.count()
    help_requests = query.offset((page - 1) * size).limit(size).all()
    
    return HelpRequestListResponse(
        help_requests=[get_help_request_response(hr, db) for hr in help_requests],
        total=total,
        page=page,
        size=size
    )

@router.post("/help-requests/{help_request_id}/accept")
def accept_help_request(
    help_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a help request"""
    help_request = db.query(HelpRequest).filter(HelpRequest.id == help_request_id).first()
    if not help_request:
        raise HTTPException(status_code=404, detail="Help request not found")
    
    if help_request.status != HelpStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Help request is not open for acceptance"
        )
    
    member = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == help_request.community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of the community to accept help requests"
        )
    
    help_request.accepted_by_id = member.id
    help_request.status = HelpStatus.ACCEPTED
    db.commit()
    
    return {"message": "Help request accepted successfully"}

# --- Event Endpoints ---

@router.post("/events", response_model=CommunityEventResponse)
def create_event(
    event_data: CommunityEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a community event"""
    member = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == event_data.community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of the community to create events"
        )
    
    db_event = CommunityEvent(
        **event_data.dict(),
        organizer_id=member.id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    return get_event_response(db_event, db)

@router.get("/events", response_model=CommunityEventListResponse)
def get_events(
    community_id: Optional[int] = Query(None),
    event_type: Optional[EventType] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get community events with filtering"""
    query = db.query(CommunityEvent)
    
    if community_id:
        query = query.filter(CommunityEvent.community_id == community_id)
    
    if event_type:
        query = query.filter(CommunityEvent.type == event_type)
    
    total = query.count()
    events = query.offset((page - 1) * size).limit(size).all()
    
    return CommunityEventListResponse(
        events=[get_event_response(event, db) for event in events],
        total=total,
        page=page,
        size=size
    )

@router.post("/events/{event_id}/join")
def join_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a community event"""
    event = db.query(CommunityEvent).filter(CommunityEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    member = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == event.community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of the community to join events"
        )
    
    existing_attendee = db.query(EventAttendee).filter(
        and_(
            EventAttendee.event_id == event_id,
            EventAttendee.member_id == member.id
        )
    ).first()
    
    if existing_attendee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already joined this event"
        )
    
    if event.max_attendees:
        attendee_count = db.query(EventAttendee).filter(EventAttendee.event_id == event_id).count()
        if attendee_count >= event.max_attendees:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is full"
            )
    
    attendee = EventAttendee(event_id=event_id, member_id=member.id)
    db.add(attendee)
    db.commit()
    
    return {"message": "Successfully joined event"}


# --- Generic/Dynamic Route (MUST BE LAST) ---

@router.get("/{community_id}", response_model=CommunityResponse)
def get_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific community details"""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    return get_community_response(community, db)




# --- Helper functions ---

def get_community_response(community: Community, db: Session) -> CommunityResponse:
    """Convert community model to response"""
    members = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == community.id,
            CommunityMember.is_active == True
        )
    ).all()
    
    leader = next((m for m in members if m.role == MemberRole.LEADER), None)
    co_leaders = [m for m in members if m.role == MemberRole.CO_LEADER]
    elders = [m for m in members if m.role == MemberRole.ELDER]
    
    age_in_days = (datetime.utcnow() - community.created_at).days
    
    help_requests = db.query(HelpRequest).filter(HelpRequest.community_id == community.id).all()
    events = db.query(CommunityEvent).filter(CommunityEvent.community_id == community.id).all()
    
    return CommunityResponse(
        id=community.id,
        name=community.name,
        description=community.description,
        location=community.location,
        area=community.area,
        latitude=community.latitude,
        longitude=community.longitude,
        is_public=community.is_public,
        image_url=community.image_url,
        created_at=community.created_at,
        updated_at=community.updated_at,
        total_members=len(members),
        age_in_days=age_in_days,
        leader=get_member_response(leader, db) if leader else None,
        co_leaders=[get_member_response(m, db) for m in co_leaders],
        elders=[get_member_response(m, db) for m in elders],
        help_requests=[get_help_request_response(hr, db) for hr in help_requests],
        events=[get_event_response(e, db) for e in events]
    )

def get_member_response(member: CommunityMember, db: Session) -> CommunityMemberResponse:
    """Convert member model to response"""
    user = db.query(User).filter(User.id == member.user_id).first()
    return CommunityMemberResponse(
        id=member.id,
        user_id=member.user_id,
        role=member.role,
        join_date=member.join_date,
        contribution_points=member.contribution_points,
        is_active=member.is_active,
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "profile_image": user.profile_image
        }
    )

def get_help_request_response(help_request: HelpRequest, db: Session) -> HelpRequestResponse:
    """Convert help request model to response"""
    requester = db.query(CommunityMember).options(joinedload(CommunityMember.user)).filter(CommunityMember.id == help_request.requester_id).first()
    accepted_by = None
    if help_request.accepted_by_id:
        accepted_by = db.query(CommunityMember).options(joinedload(CommunityMember.user)).filter(CommunityMember.id == help_request.accepted_by_id).first()
    
    return HelpRequestResponse(
        id=help_request.id,
        community_id=help_request.community_id,
        requester_id=help_request.requester_id,
        accepted_by_id=help_request.accepted_by_id,
        title=help_request.title,
        description=help_request.description,
        category=help_request.category,
        urgency=help_request.urgency,
        location=help_request.location,
        is_paid=help_request.is_paid,
        amount=help_request.amount,
        status=help_request.status,
        tags=json.loads(help_request.tags) if help_request.tags else [],
        created_at=help_request.created_at,
        updated_at=help_request.updated_at,
        requester={
            "id": requester.id,
            "user": {
                "id": requester.user.id,
                "full_name": requester.user.full_name,
                "email": requester.user.email,
                "phone": requester.user.phone,
                "profile_image": requester.user.profile_image
            }
        },
        accepted_by={
            "id": accepted_by.id,
            "user": {
                "id": accepted_by.user.id,
                "full_name": accepted_by.user.full_name,
                "email": accepted_by.user.email,
                "phone": accepted_by.user.phone,
                "profile_image": accepted_by.user.profile_image
            }
        } if accepted_by else None
    )

def get_event_response(event: CommunityEvent, db: Session) -> CommunityEventResponse:
    """Convert event model to response"""
    organizer = db.query(CommunityMember).options(joinedload(CommunityMember.user)).filter(CommunityMember.id == event.organizer_id).first()
    attendee_count = db.query(EventAttendee).filter(EventAttendee.event_id == event.id).count()
    
    return CommunityEventResponse(
        id=event.id,
        community_id=event.community_id,
        organizer_id=event.organizer_id,
        title=event.title,
        description=event.description,
        type=event.type,
        location=event.location,
        event_date=event.event_date,
        event_time=event.event_time,
        max_attendees=event.max_attendees,
        is_free=event.is_free,
        fee=event.fee,
        image_url=event.image_url,
        created_at=event.created_at,
        updated_at=event.updated_at,
        organizer={
            "id": organizer.id,
            "user": {
                "id": organizer.user.id,
                "full_name": organizer.user.full_name,
                "email": organizer.user.email,
                "phone": organizer.user.phone,
                "profile_image": organizer.user.profile_image
            }
        },
        attendee_count=attendee_count
    )

# === COMMUNITY CHAT ENDPOINTS ===

@router.get("/{community_id}/chat", response_model=ChatHistoryResponse)
def get_community_chat_history(
    community_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat history for a community"""
    # Check if user is a member of the community
    membership = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this community to view chat"
        )
    
    # Get total count
    total = db.query(CommunityMessage).filter(
        and_(
            CommunityMessage.community_id == community_id,
            CommunityMessage.is_deleted == False
        )
    ).count()
    
    # Get messages with pagination
    offset = (page - 1) * size
    messages = db.query(CommunityMessage).filter(
        and_(
            CommunityMessage.community_id == community_id,
            CommunityMessage.is_deleted == False
        )
    ).order_by(CommunityMessage.created_at.desc()).offset(offset).limit(size).all()
    
    # Transform messages to response format
    message_responses = []
    for message in messages:
        user = db.query(User).filter(User.id == message.user_id).first()
        message_responses.append(ChatMessageResponse(
            id=message.id,
            community_id=message.community_id,
            user_id=message.user_id,
            message_type=message.message_type.value,
            content=message.content,
            metadata=message.message_metadata,
            created_at=message.created_at,
            user={
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "profile_image": user.profile_image
            }
        ))
    
    return ChatHistoryResponse(
        messages=list(reversed(message_responses)),  # Reverse to show oldest first
        total=total,
        page=page,
        size=size
    )

@router.post("/{community_id}/chat", response_model=ChatMessageResponse)
def send_community_chat_message(
    community_id: int,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to community chat"""
    # Check if user is a member of the community
    membership = db.query(CommunityMember).filter(
        and_(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id,
            CommunityMember.is_active == True
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this community to send messages"
        )
    
    # Create message
    message = CommunityMessage(
        community_id=community_id,
        user_id=current_user.id,
        message_type=CommunityMessageType(message_data.message_type),
        content=message_data.content,
        message_metadata=message_data.metadata
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Return response
    return ChatMessageResponse(
        id=message.id,
        community_id=message.community_id,
        user_id=message.user_id,
        message_type=message.message_type.value,
        content=message.content,
        metadata=message.message_metadata,
        created_at=message.created_at,
        user={
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "profile_image": current_user.profile_image
        }
    )