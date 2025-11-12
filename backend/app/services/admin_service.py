from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from app.models.admin import AdminUser, ActivityLog, SupportTicket, ModerationQueue
from app.models.user import User
from app.models.sensor import SensorConfig
from app.models.detection import DetectionHistory
from app.schemas.admin import (
    AdminUserCreate, AdminUserUpdate, ActivityLogCreate,
    DashboardMetrics, UserGrowthData, DiseaseStatistic
)
from app.auth.security import get_password_hash, verify_password
from fastapi import HTTPException, status


class AdminService:
    """Service layer for admin operations"""
    
    @staticmethod
    async def create_admin_user(db: Session, admin_data: AdminUserCreate) -> AdminUser:
        """Create a new admin user"""
        # Check if email already exists
        existing = db.query(AdminUser).filter(AdminUser.email == admin_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = get_password_hash(admin_data.password)
        
        # Create admin user
        admin = AdminUser(
            email=admin_data.email,
            full_name=admin_data.full_name,
            role=admin_data.role,
            password_hash=password_hash,
            created_at=datetime.utcnow()
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        return admin
    
    @staticmethod
    async def authenticate_admin(db: Session, email: str, password: str) -> Optional[AdminUser]:
        """Authenticate admin user"""
        admin = db.query(AdminUser).filter(AdminUser.email == email).first()
        
        if not admin or not verify_password(password, admin.password_hash):
            return None
        
        if not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is inactive"
            )
        
        # Update last login
        admin.last_login = datetime.utcnow()
        db.commit()
        
        return admin
    
    @staticmethod
    async def log_activity(
        db: Session,
        admin_id: int,
        action: str,
        target_type: Optional[str] = None,
        target_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> ActivityLog:
        """Log admin activity"""
        log = ActivityLog(
            admin_id=admin_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        
        db.add(log)
        db.commit()
        db.refresh(log)
        
        return log
    
    @staticmethod
    async def get_dashboard_metrics(db: Session) -> DashboardMetrics:
        """Get comprehensive dashboard metrics"""
        try:
            today = datetime.utcnow().date()
            week_ago = datetime.utcnow() - timedelta(days=7)
            month_start = datetime.utcnow().replace(day=1)
            
            # User metrics
            try:
                total_users = db.query(func.count(User.id)).scalar() or 0
                active_users = db.query(func.count(User.id)).filter(
                    User.last_login >= week_ago
                ).scalar() or 0
                new_users_today = db.query(func.count(User.id)).filter(
                    func.date(User.created_at) == today
                ).scalar() or 0
            except Exception as e:
                print(f"Error fetching user metrics: {e}")
                total_users = active_users = new_users_today = 0
            
            # Sensor metrics
            try:
                total_sensors = db.query(func.count(SensorConfig.id)).scalar() or 0
                online_sensors = db.query(func.count(SensorConfig.id)).filter(
                    SensorConfig.is_active == True
                ).scalar() or 0
                sensor_uptime = (online_sensors / total_sensors * 100) if total_sensors > 0 else 0
            except Exception as e:
                print(f"Error fetching sensor metrics: {e}")
                total_sensors = online_sensors = 0
                sensor_uptime = 0
            
            # Detection metrics
            try:
                detections_today = db.query(func.count(DetectionHistory.id)).filter(
                    func.date(DetectionHistory.detected_at) == today
                ).scalar() or 0
                detections_week = db.query(func.count(DetectionHistory.id)).filter(
                    DetectionHistory.detected_at >= week_ago
                ).scalar() or 0
            except Exception as e:
                print(f"Error fetching detection metrics: {e}")
                detections_today = detections_week = 0
            
            # Support tickets (might not exist)
            try:
                open_tickets = db.query(func.count(SupportTicket.id)).filter(
                    SupportTicket.status.in_(['open', 'in_progress'])
                ).scalar() or 0
            except Exception as e:
                print(f"Support tickets table not available: {e}")
                open_tickets = 0
            
            # Moderation queue (might not exist)
            try:
                pending_moderation = db.query(func.count(ModerationQueue.id)).filter(
                    ModerationQueue.status == 'pending'
                ).scalar() or 0
            except Exception as e:
                print(f"Moderation queue table not available: {e}")
                pending_moderation = 0
            
            # Revenue (placeholder - implement based on your transaction model)
            monthly_revenue = 0.0  # TODO: Calculate from transactions
            
            return DashboardMetrics(
                total_users=total_users,
                active_users=active_users,
                new_users_today=new_users_today,
                total_sensors=total_sensors,
                online_sensors=online_sensors,
                sensor_uptime_percent=round(sensor_uptime, 2),
                detections_today=detections_today,
                detections_this_week=detections_week,
                open_tickets=open_tickets,
                monthly_revenue=monthly_revenue,
                pending_moderation=pending_moderation,
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            print(f"Critical error in get_dashboard_metrics: {e}")
            # Return default metrics if everything fails
            return DashboardMetrics(
                total_users=0,
                active_users=0,
                new_users_today=0,
                total_sensors=0,
                online_sensors=0,
                sensor_uptime_percent=0,
                detections_today=0,
                detections_this_week=0,
                open_tickets=0,
                monthly_revenue=0,
                pending_moderation=0,
                timestamp=datetime.utcnow()
            )
    
    @staticmethod
    async def get_user_growth_stats(db: Session, days: int = 30) -> List[UserGrowthData]:
        """Get user growth statistics over time"""
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days)
        
        growth_data = []
        running_total = db.query(func.count(User.id)).filter(
            func.date(User.created_at) < start_date
        ).scalar() or 0
        
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            
            new_users = db.query(func.count(User.id)).filter(
                func.date(User.created_at) == current_date
            ).scalar() or 0
            
            running_total += new_users
            
            growth_data.append(UserGrowthData(
                date=current_date.isoformat(),
                new_users=new_users,
                total_users=running_total
            ))
        
        return growth_data
    
    @staticmethod
    async def get_disease_statistics(db: Session, days: int = 30) -> List[DiseaseStatistic]:
        """Get disease detection statistics"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get detection counts by disease
        disease_counts = db.query(
            DetectionHistory.disease_name,
            func.count(DetectionHistory.id).label('count')
        ).filter(
            DetectionHistory.detected_at >= cutoff_date
        ).group_by(
            DetectionHistory.disease_name
        ).order_by(
            desc('count')
        ).all()
        
        total = sum(count for _, count in disease_counts)
        
        return [
            DiseaseStatistic(
                disease_name=disease,
                count=count,
                percentage=round((count / total * 100) if total > 0 else 0, 2)
            )
            for disease, count in disease_counts
        ]
    
    @staticmethod
    async def get_all_users(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[User]:
        """Get all users with optional filtering"""
        query = db.query(User)
        
        if search:
            query = query.filter(
                (User.full_name.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%"))
            )
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        return query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    async def suspend_user(db: Session, user_id: int, admin_id: int, reason: Optional[str] = None):
        """Suspend a user account"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = 0
        db.commit()
        
        # Log activity
        await AdminService.log_activity(
            db=db,
            admin_id=admin_id,
            action="user_suspended",
            target_type="user",
            target_id=user_id,
            details={"reason": reason} if reason else None
        )
        
        return {"message": "User suspended successfully"}
    
    @staticmethod
    async def activate_user(db: Session, user_id: int, admin_id: int):
        """Activate a suspended user account"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = 1
        db.commit()
        
        # Log activity
        await AdminService.log_activity(
            db=db,
            admin_id=admin_id,
            action="user_activated",
            target_type="user",
            target_id=user_id
        )
        
        return {"message": "User activated successfully"}
    
    @staticmethod
    async def get_recent_activities(
        db: Session,
        limit: int = 50
    ) -> List[ActivityLog]:
        """Get recent admin activities"""
        return db.query(ActivityLog).order_by(
            desc(ActivityLog.timestamp)
        ).limit(limit).all()
    
    @staticmethod
    async def get_all_sensors(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[SensorConfig]:
        """Get all sensors with optional filtering"""
        query = db.query(SensorConfig)
        
        if status:
            query = query.filter(SensorConfig.is_active == (status == 'active'))
        
        return query.order_by(desc(SensorConfig.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_recent_detections(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[DetectionHistory]:
        """Get recent disease detections"""
        return db.query(DetectionHistory).order_by(
            desc(DetectionHistory.detected_at)
        ).offset(skip).limit(limit).all()
