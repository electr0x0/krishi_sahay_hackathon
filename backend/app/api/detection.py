from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
import cv2
import numpy as np
import base64
import os
import uuid
from datetime import datetime
from typing import List

from app.database import get_db
from app.models.detection import DetectionHistory
from app.models.user import User
from app.schemas.detection import DetectionRequest, DetectionResponse, DetectionHistoryResponse
from app.services.detection_service import PlantDiseaseDetector
from app.auth.dependencies import get_current_active_user

router = APIRouter()

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "visionmodels", "plantvillage.pt")

@router.post("/detect", response_model=DetectionResponse)
async def detect_plant_disease(
    request: DetectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Detect plant diseases in uploaded image.
    """
    try:
        # Initialize detector
        detector = PlantDiseaseDetector(
            model_path=MODEL_PATH,
            conf_threshold=request.confidence_threshold
        )
        
        # Create directories if they don't exist
        upload_dir = "uploads/images/detection"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filenames
        file_id = str(uuid.uuid4())
        original_filename = f"original_{file_id}_{request.file_name}"
        processed_filename = f"processed_{file_id}_{request.file_name}"
        
        original_path = os.path.join(upload_dir, original_filename)
        processed_path = os.path.join(upload_dir, processed_filename)
        
        # Decode and save original image
        try:
            image_bytes = base64.b64decode(request.file_content)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise HTTPException(status_code=400, detail="Invalid image data")
                
            cv2.imwrite(original_path, image)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")
        
        # Process image for detection
        start_time = datetime.now()
        processed_image, detections = detector.predict(original_path)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Save processed image
        cv2.imwrite(processed_path, processed_image)
        
        # Save detection history to database
        detection_history = DetectionHistory(
            user_id=current_user.id,
            original_image_path=original_path,
            processed_image_path=processed_path,
            detections=detections,
            detection_count=len(detections),
            processing_time=processing_time,
            confidence_threshold=request.confidence_threshold,
            success=True
        )
        
        db.add(detection_history)
        db.commit()
        db.refresh(detection_history)
        
        return DetectionResponse(
            success=True,
            message="Plant disease detection completed successfully",
            detection_id=detection_history.id,
            detections=detections,
            detection_count=len(detections),
            original_image_url=f"/uploads/images/detection/{original_filename}",
            processed_image_url=f"/uploads/images/detection/{processed_filename}",
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Save error to database
        detection_history = DetectionHistory(
            user_id=current_user.id,
            original_image_path=original_path if 'original_path' in locals() else "",
            processed_image_path="",
            detections=[],
            detection_count=0,
            processing_time=0,
            confidence_threshold=request.confidence_threshold,
            success=False,
            error_message=str(e)
        )
        
        db.add(detection_history)
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Error processing detection: {str(e)}")

@router.get("/history", response_model=DetectionHistoryResponse)
async def get_detection_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user's detection history.
    """
    try:
        # Get total count
        total_count = db.query(DetectionHistory).filter(
            DetectionHistory.user_id == current_user.id
        ).count()
        
        # Get history with pagination
        history = db.query(DetectionHistory).filter(
            DetectionHistory.user_id == current_user.id
        ).order_by(DetectionHistory.created_at.desc()).offset(skip).limit(limit).all()
        
        # Convert file paths to URLs
        for item in history:
            if item.original_image_path:
                # Convert absolute path to relative URL
                item.original_image_path = item.original_image_path.replace("uploads/", "/uploads/")
            if item.processed_image_path:
                item.processed_image_path = item.processed_image_path.replace("uploads/", "/uploads/")
        
        return DetectionHistoryResponse(
            success=True,
            history=history,
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching detection history: {str(e)}")

@router.get("/history/{detection_id}")
async def get_detection_by_id(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get specific detection result by ID.
    """
    try:
        detection = db.query(DetectionHistory).filter(
            DetectionHistory.id == detection_id,
            DetectionHistory.user_id == current_user.id
        ).first()
        
        if not detection:
            raise HTTPException(status_code=404, detail="Detection not found")
        
        # Convert file paths to URLs
        if detection.original_image_path:
            detection.original_image_path = detection.original_image_path.replace("uploads/", "/uploads/")
        if detection.processed_image_path:
            detection.processed_image_path = detection.processed_image_path.replace("uploads/", "/uploads/")
        
        return detection
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching detection: {str(e)}")

@router.delete("/history/{detection_id}")
async def delete_detection(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a detection record and associated files.
    """
    try:
        detection = db.query(DetectionHistory).filter(
            DetectionHistory.id == detection_id,
            DetectionHistory.user_id == current_user.id
        ).first()
        
        if not detection:
            raise HTTPException(status_code=404, detail="Detection not found")
        
        # Delete associated files
        try:
            if detection.original_image_path and os.path.exists(detection.original_image_path):
                os.remove(detection.original_image_path)
            if detection.processed_image_path and os.path.exists(detection.processed_image_path):
                os.remove(detection.processed_image_path)
        except Exception as e:
            print(f"Warning: Could not delete files: {str(e)}")
        
        # Delete database record
        db.delete(detection)
        db.commit()
        
        return {"success": True, "message": "Detection deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting detection: {str(e)}")
