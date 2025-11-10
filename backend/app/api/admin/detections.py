from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.api.admin.dependencies import require_admin
from app.services.admin_service import AdminService
from app.models.user import User
from app.models.detection import DetectionHistory


router = APIRouter(prefix="/admin/detections", tags=["admin-detections"])


@router.get("/")
async def get_all_detections(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get all disease detections with pagination
    
    Returns list of recent disease detections for monitoring
    """
    try:
        detections = await AdminService.get_recent_detections(db, skip, limit)
        
        return [{
            "id": detection.id,
            "user_id": detection.user_id,
            "disease_name": detection.disease_name,
            "confidence": detection.confidence,
            "crop_type": detection.crop_type if hasattr(detection, 'crop_type') else None,
            "severity": detection.severity if hasattr(detection, 'severity') else None,
            "image_url": detection.image_url if hasattr(detection, 'image_url') else None,
            "detected_at": detection.detected_at.isoformat() if detection.detected_at else None,
        } for detection in detections]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch detections: {str(e)}"
        )


@router.get("/{detection_id}")
async def get_detection_details(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get detailed information about a specific detection
    
    Returns full detection data including image and metadata
    """
    try:
        detection = db.query(DetectionHistory).filter(DetectionHistory.id == detection_id).first()
        
        if not detection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Detection not found"
            )
        
        return {
            "id": detection.id,
            "user_id": detection.user_id,
            "disease_name": detection.disease_name,
            "confidence": detection.confidence,
            "crop_type": detection.crop_type if hasattr(detection, 'crop_type') else None,
            "severity": detection.severity if hasattr(detection, 'severity') else None,
            "image_url": detection.image_url if hasattr(detection, 'image_url') else None,
            "treatment_recommended": detection.treatment if hasattr(detection, 'treatment') else None,
            "detected_at": detection.detected_at.isoformat() if detection.detected_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch detection details: {str(e)}"
        )


@router.get("/stats/summary")
async def get_detection_stats_summary(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get detection statistics summary
    
    Returns aggregated detection metrics for dashboard
    """
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        total = db.query(func.count(Detection.id)).filter(
            Detection.detected_at >= cutoff_date
        ).scalar() or 0
        
        # Get disease breakdown
        disease_counts = db.query(
            Detection.disease_name,
            func.count(Detection.id).label('count')
        ).filter(
            Detection.detected_at >= cutoff_date
        ).group_by(
            Detection.disease_name
        ).order_by(
            func.count(Detection.id).desc()
        ).limit(10).all()
        
        return {
            "total_detections": total,
            "period_days": days,
            "top_diseases": [
                {
                    "disease": disease,
                    "count": count,
                    "percentage": round((count / total * 100) if total > 0 else 0, 2)
                }
                for disease, count in disease_counts
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch detection stats: {str(e)}"
        )


@router.get("/stats/by-crop")
async def get_detections_by_crop(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get detection statistics grouped by crop type
    
    Returns detection counts per crop for analysis
    """
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Check if crop_type column exists
        if not hasattr(Detection, 'crop_type'):
            return {"message": "Crop type data not available"}
        
        crop_stats = db.query(
            Detection.crop_type,
            func.count(Detection.id).label('count')
        ).filter(
            Detection.detected_at >= cutoff_date
        ).group_by(
            Detection.crop_type
        ).order_by(
            func.count(Detection.id).desc()
        ).all()
        
        total = sum(count for _, count in crop_stats)
        
        return {
            "crops": [
                {
                    "crop_type": crop,
                    "detections": count,
                    "percentage": round((count / total * 100) if total > 0 else 0, 2)
                }
                for crop, count in crop_stats
            ],
            "total_detections": total,
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch crop statistics: {str(e)}"
        )


@router.get("/stats/accuracy")
async def get_detection_accuracy_stats(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get detection accuracy statistics
    
    Returns confidence score distribution for model monitoring
    """
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get average confidence
        avg_confidence = db.query(
            func.avg(Detection.confidence)
        ).filter(
            Detection.detected_at >= cutoff_date
        ).scalar() or 0
        
        # Count by confidence ranges
        high_confidence = db.query(func.count(Detection.id)).filter(
            Detection.detected_at >= cutoff_date,
            Detection.confidence >= 0.9
        ).scalar() or 0
        
        medium_confidence = db.query(func.count(Detection.id)).filter(
            Detection.detected_at >= cutoff_date,
            Detection.confidence >= 0.7,
            Detection.confidence < 0.9
        ).scalar() or 0
        
        low_confidence = db.query(func.count(Detection.id)).filter(
            Detection.detected_at >= cutoff_date,
            Detection.confidence < 0.7
        ).scalar() or 0
        
        total = high_confidence + medium_confidence + low_confidence
        
        return {
            "average_confidence": round(float(avg_confidence), 4),
            "confidence_distribution": {
                "high": {
                    "count": high_confidence,
                    "percentage": round((high_confidence / total * 100) if total > 0 else 0, 2),
                    "range": "90-100%"
                },
                "medium": {
                    "count": medium_confidence,
                    "percentage": round((medium_confidence / total * 100) if total > 0 else 0, 2),
                    "range": "70-89%"
                },
                "low": {
                    "count": low_confidence,
                    "percentage": round((low_confidence / total * 100) if total > 0 else 0, 2),
                    "range": "0-69%"
                }
            },
            "total_detections": total,
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch accuracy stats: {str(e)}"
        )
