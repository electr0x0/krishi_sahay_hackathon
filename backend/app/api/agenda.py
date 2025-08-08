from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.agenda import Agenda, AgendaStatus, AgendaPriority
from app.schemas.agenda import (
    AgendaCreate, AgendaUpdate, AgendaResponse, AgendaListResponse,
    AIAgendaRequest, AIAgendaResponse, AgendaStatusSchema
)
from app.services.ai_agenda_service import ai_agenda_service

router = APIRouter(prefix="/agendas", tags=["agendas"])


@router.post("/", response_model=AgendaResponse)
async def create_agenda(
    *,
    db: Session = Depends(get_db),
    agenda_in: AgendaCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new agenda item"""
    agenda = Agenda(
        title=agenda_in.title,
        description=agenda_in.description,
        priority=agenda_in.priority,
        agenda_type=agenda_in.agenda_type,
        scheduled_date=agenda_in.scheduled_date,
        due_date=agenda_in.due_date,
        estimated_duration=agenda_in.estimated_duration,
        user_id=current_user.id,
        created_by_ai=False
    )
    
    db.add(agenda)
    db.commit()
    db.refresh(agenda)
    
    return agenda


@router.get("/", response_model=AgendaListResponse)
async def get_agendas(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, ge=1, le=100)
):
    """Get user's agendas"""
    result = await ai_agenda_service.get_user_agendas(
        user_id=current_user.id,
        db=db,
        status_filter=status,
        limit=limit
    )
    
    return AgendaListResponse(**result)


@router.get("/today", response_model=List[AgendaResponse])
async def get_today_agendas(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get today's agendas"""
    today = datetime.now().date()
    
    agendas = db.query(Agenda).filter(
        Agenda.user_id == current_user.id,
        Agenda.scheduled_date >= today,
        Agenda.scheduled_date < today + timedelta(days=1),
        Agenda.status.in_([AgendaStatus.PENDING, AgendaStatus.IN_PROGRESS])
    ).order_by(
        Agenda.priority.desc(),
        Agenda.scheduled_date.asc()
    ).all()
    
    return agendas


@router.get("/{agenda_id}", response_model=AgendaResponse)
async def get_agenda(
    agenda_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific agenda"""
    agenda = db.query(Agenda).filter(
        Agenda.id == agenda_id,
        Agenda.user_id == current_user.id
    ).first()
    
    if not agenda:
        raise HTTPException(status_code=404, detail="Agenda not found")
    
    return agenda


@router.put("/{agenda_id}", response_model=AgendaResponse)
async def update_agenda(
    agenda_id: int,
    agenda_update: AgendaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an agenda"""
    agenda = db.query(Agenda).filter(
        Agenda.id == agenda_id,
        Agenda.user_id == current_user.id
    ).first()
    
    if not agenda:
        raise HTTPException(status_code=404, detail="Agenda not found")
    
    update_data = agenda_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(agenda, field, value)
    
    # Set completion time if status changed to completed
    if agenda_update.status == AgendaStatusSchema.COMPLETED and agenda.completed_at is None:
        agenda.completed_at = datetime.now()
    
    db.commit()
    db.refresh(agenda)
    
    return agenda


@router.delete("/{agenda_id}")
async def delete_agenda(
    agenda_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an agenda"""
    agenda = db.query(Agenda).filter(
        Agenda.id == agenda_id,
        Agenda.user_id == current_user.id
    ).first()
    
    if not agenda:
        raise HTTPException(status_code=404, detail="Agenda not found")
    
    db.delete(agenda)
    db.commit()
    
    return {"message": "Agenda deleted successfully"}


@router.post("/ai-suggestions", response_model=AIAgendaResponse)
async def generate_ai_suggestions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    request: AIAgendaRequest = AIAgendaRequest()
):
    """Generate AI-powered agenda suggestions"""
    result = await ai_agenda_service.generate_ai_agendas(
        user_id=current_user.id,
        db=db,
        force_refresh=request.force_refresh,
        max_suggestions=request.max_suggestions
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return AIAgendaResponse(**result)


@router.post("/{agenda_id}/complete")
async def complete_agenda(
    agenda_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark an agenda as completed"""
    agenda = db.query(Agenda).filter(
        Agenda.id == agenda_id,
        Agenda.user_id == current_user.id
    ).first()
    
    if not agenda:
        raise HTTPException(status_code=404, detail="Agenda not found")
    
    agenda.status = AgendaStatus.COMPLETED
    agenda.completed_at = datetime.now()
    
    db.commit()
    db.refresh(agenda)
    
    return {"message": "Agenda completed successfully", "agenda": agenda}


@router.get("/stats/overview")
async def get_agenda_stats(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get agenda statistics overview"""
    from sqlalchemy import func, and_
    from datetime import date, timedelta
    
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    
    stats = {
        "total": db.query(Agenda).filter(Agenda.user_id == current_user.id).count(),
        "pending": db.query(Agenda).filter(
            and_(Agenda.user_id == current_user.id, Agenda.status == AgendaStatus.PENDING)
        ).count(),
        "completed": db.query(Agenda).filter(
            and_(Agenda.user_id == current_user.id, Agenda.status == AgendaStatus.COMPLETED)
        ).count(),
        "today": db.query(Agenda).filter(
            and_(
                Agenda.user_id == current_user.id,
                func.date(Agenda.scheduled_date) == today,
                Agenda.status.in_([AgendaStatus.PENDING, AgendaStatus.IN_PROGRESS])
            )
        ).count(),
        "this_week": db.query(Agenda).filter(
            and_(
                Agenda.user_id == current_user.id,
                Agenda.scheduled_date >= week_start,
                Agenda.scheduled_date < week_start + timedelta(days=7),
                Agenda.status.in_([AgendaStatus.PENDING, AgendaStatus.IN_PROGRESS])
            )
        ).count(),
        "ai_generated": db.query(Agenda).filter(
            and_(Agenda.user_id == current_user.id, Agenda.created_by_ai == True)
        ).count()
    }
    
    return stats
