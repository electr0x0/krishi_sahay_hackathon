from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.api.admin.dependencies import require_admin
from app.services.admin_service import AdminService
from app.schemas.admin import UserListItem, UserActionRequest
from app.models.user import User


router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("/", response_model=List[dict])
async def get_all_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    search: Optional[str] = Query(default=None, description="Search by username or email"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get all users with pagination and filtering
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **search**: Search term for username/email
    - **is_active**: Filter by active status
    """
    try:
        users = await AdminService.get_all_users(db, skip, limit, search, is_active)
        
        return [{
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "location": f"{user.village}, {user.upazila}" if user.village and user.upazila else (user.district or "N/A"),
            "status": "active" if user.is_active else "inactive",
            "role": user.role or "user",
            "farm_size": 0,  # TODO: Calculate from farm data
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        } for user in users]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.get("/{user_id}")
async def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get detailed information about a specific user
    
    Returns comprehensive user data including:
    - Profile information
    - Farm data
    - Sensor assignments
    - Detection history
    - Marketplace activity
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get related counts (you can enhance this based on your models)
        # farm_count = db.query(Farm).filter(Farm.user_id == user_id).count()
        # sensor_count = db.query(Sensor).filter(Sensor.user_id == user_id).count()
        # detection_count = db.query(Detection).filter(Detection.user_id == user_id).count()
        
        return {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "location": f"{user.village}, {user.upazila}" if user.village and user.upazila else (user.district or "N/A"),
            "is_active": bool(user.is_active),
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            # "farm_count": farm_count,
            # "sensor_count": sensor_count,
            # "detection_count": detection_count,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user details: {str(e)}"
        )


@router.patch("/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Suspend a user account
    
    This will deactivate the user's account and log the action
    """
    try:
        result = await AdminService.suspend_user(
            db=db,
            user_id=user_id,
            admin_id=current_user.id,
            reason=reason
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suspend user: {str(e)}"
        )


@router.patch("/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Activate a suspended user account
    
    This will reactivate the user's account and log the action
    """
    try:
        result = await AdminService.activate_user(
            db=db,
            user_id=user_id,
            admin_id=current_user.id
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to activate user: {str(e)}"
        )


@router.patch("/{user_id}/role")
async def change_user_role(
    user_id: int,
    role: str = Query(..., regex="^(user|premium|moderator|admin)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Change a user's role
    
    Available roles: user, premium, moderator, admin
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        old_role = user.role or "user"
        user.role = role
        db.commit()
        
        # Log activity
        await AdminService.log_activity(
            db=db,
            admin_id=current_user.id,
            action="user_role_changed",
            target_type="user",
            target_id=user_id,
            details={
                "name": user.full_name,
                "old_role": old_role,
                "new_role": role
            }
        )
        
        return {
            "message": "User role updated successfully",
            "user_id": user_id,
            "old_role": old_role,
            "new_role": role
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change user role: {str(e)}"
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a user account (use with caution)
    
    This is a permanent action and should be used carefully
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Log activity before deleting
        await AdminService.log_activity(
            db=db,
            admin_id=current_user.id,
            action="user_deleted",
            target_type="user",
            target_id=user_id,
            details={"name": user.full_name, "email": user.email}
        )
        
        db.delete(user)
        db.commit()
        
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )


@router.get("/stats/summary")
async def get_user_stats_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get user statistics summary
    
    Returns aggregated user metrics for dashboard
    """
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        total = db.query(func.count(User.id)).scalar() or 0
        active = db.query(func.count(User.id)).filter(User.is_active == 1).scalar() or 0
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_logins = db.query(func.count(User.id)).filter(User.last_login >= week_ago).scalar() or 0
        
        return {
            "total_users": total,
            "active_users": active,
            "inactive_users": total - active,
            "recent_logins": recent_logins,
            "active_percentage": round((active / total * 100) if total > 0 else 0, 2)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user stats: {str(e)}"
        )
