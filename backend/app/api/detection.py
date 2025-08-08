from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import cv2
import numpy as np
import base64
import os
import uuid
import json
import asyncio
from datetime import datetime
from typing import List, Optional

from app.database import get_db
from app.models.detection import DetectionHistory, DetectionAlert
from app.models.user import User, UserPreferences
from app.schemas.detection import (
    DetectionRequest, DetectionResponse, DetectionHistoryResponse, DetectionHistoryItem,
    DetectionAlertCreate, DetectionAlert as DetectionAlertSchema, DetectionAlertResponse
)
from app.services.detection_service import PlantDiseaseDetector
from app.services.video_detection_service import VideoPlantDiseaseDetector
from app.auth.dependencies import get_current_active_user

router = APIRouter()

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "visionmodels", "plantvillage.pt")


def create_detection_alert(
    db: Session,
    user_id: int,
    detection_history_id: int,
    detections: List[dict]
) -> Optional[DetectionAlert]:
    """
    Create an alert when diseases are detected
    """
    try:
        # Only create alert if diseases were detected
        if not detections:
            return None
        
        # Extract disease information with deduplication
        disease_dict = {}  # disease_name -> highest_confidence
        
        for detection in detections:
            disease_name = detection.get('class_name', '')
            confidence = detection.get('confidence', 0.0)
            
            # Only include actual diseases (not healthy plants)
            if 'healthy' not in disease_name.lower() and 'normal' not in disease_name.lower():
                # Keep only the highest confidence for each disease
                if disease_name not in disease_dict or confidence > disease_dict[disease_name]:
                    disease_dict[disease_name] = confidence
        
        # Convert dict to lists
        disease_names = list(disease_dict.keys())
        confidence_scores = list(disease_dict.values())
        highest_confidence = max(confidence_scores) if confidence_scores else 0.0
        
        # If no diseases found (all healthy), don't create alert
        if not disease_names:
            return None
        
        # Determine alert type and severity
        disease_count = len(disease_names)
        if disease_count > 1:
            alert_type = "multiple_diseases"
            severity = "high"
        elif highest_confidence > 0.8:
            alert_type = "severe_disease"
            severity = "high"
        else:
            alert_type = "disease_detected"
            severity = "medium"
        
        # Create Bengali and English messages
        disease_list_bn = ", ".join(disease_names)
        disease_list_en = ", ".join(disease_names)
        
        if disease_count == 1:
            title_bn = f"রোগ সনাক্ত: {disease_names[0]}"
            title_en = f"Disease Detected: {disease_names[0]}"
            message_bn = f"আপনার ফসলে {disease_names[0]} রোগ সনাক্ত করা হয়েছে। আত্মবিশ্বাস: {highest_confidence:.1%}"
            message_en = f"{disease_names[0]} disease detected in your crop. Confidence: {highest_confidence:.1%}"
        else:
            title_bn = f"একাধিক রোগ সনাক্ত ({disease_count}টি)"
            title_en = f"Multiple Diseases Detected ({disease_count})"
            message_bn = f"আপনার ফসলে {disease_count}টি রোগ সনাক্ত করা হয়েছে: {disease_list_bn}"
            message_en = f"{disease_count} diseases detected in your crop: {disease_list_en}"
        
        # Create recommendations
        recommendations_bn = "অবিলম্বে কৃষি বিশেষজ্ঞের সাথে যোগাযোগ করুন এবং উপযুক্ত চিকিৎসা শুরু করুন।"
        recommendations_en = "Contact an agricultural expert immediately and start appropriate treatment."
        
        # Create alert record
        detection_alert = DetectionAlert(
            user_id=user_id,
            detection_history_id=detection_history_id,
            alert_type=alert_type,
            severity=severity,
            disease_names=disease_names,
            confidence_scores=confidence_scores,
            title_bn=title_bn,
            title_en=title_en,
            message_bn=message_bn,
            message_en=message_en,
            recommendations_bn=recommendations_bn,
            recommendations_en=recommendations_en
        )
        
        db.add(detection_alert)
        db.commit()
        db.refresh(detection_alert)
        
        return detection_alert
        
    except Exception as e:
        print(f"Error creating detection alert: {e}")
        return None

@router.post("/detect", response_model=DetectionResponse)
async def detect_plant_disease(
    file: UploadFile = File(...),
    confidence_threshold: Optional[float] = Form(0.25),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Detect plant diseases in uploaded image.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file")
        
        # Initialize detector
        detector = PlantDiseaseDetector(
            model_path=MODEL_PATH,
            conf_threshold=confidence_threshold
        )
        
        # Create directories if they don't exist
        upload_dir = "uploads/images/detection"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filenames
        file_id = str(uuid.uuid4())
        original_filename = f"original_{file_id}_{file.filename}"
        processed_filename = f"processed_{file_id}_{file.filename}"
        
        original_path = os.path.join(upload_dir, original_filename)
        processed_path = os.path.join(upload_dir, processed_filename)
        
        # Read and save original image
        try:
            # Read file content
            file_content = await file.read()
            
            # Convert to numpy array and decode image
            nparr = np.frombuffer(file_content, np.uint8)
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
            confidence_threshold=confidence_threshold,
            success=True
        )
        
        db.add(detection_history)
        db.commit()
        db.refresh(detection_history)
        
        # Create alert if diseases are detected and user has pest_alerts enabled
        alert_created = None
        # Check if user has preferences and pest_alerts is enabled (default to True if preferences don't exist)
        pest_alerts_enabled = True  # Default value
        if current_user.preferences:
            pest_alerts_enabled = current_user.preferences.pest_alerts
        
        if pest_alerts_enabled:
            alert_created = create_detection_alert(
                db=db,
                user_id=current_user.id,
                detection_history_id=detection_history.id,
                detections=detections
            )
        
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
            confidence_threshold=confidence_threshold,
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
        history_records = db.query(DetectionHistory).filter(
            DetectionHistory.user_id == current_user.id
        ).order_by(DetectionHistory.created_at.desc()).offset(skip).limit(limit).all()
        
        # Transform database objects to response objects
        history_items = []
        for record in history_records:
            # Convert file paths to URLs
            original_url = record.original_image_path.replace("\\", "/").replace("uploads/", "/uploads/") if record.original_image_path else ""
            processed_url = record.processed_image_path.replace("\\", "/").replace("uploads/", "/uploads/") if record.processed_image_path else ""
            
            history_item = DetectionHistoryItem(
                id=record.id,
                original_image_url=original_url,
                processed_image_url=processed_url,
                detections=record.detections or [],
                detection_count=record.detection_count,
                processing_time=record.processing_time or 0.0,
                confidence_threshold=record.confidence_threshold,
                success=record.success,
                error_message=record.error_message,
                created_at=record.created_at
            )
            history_items.append(history_item)
        
        return DetectionHistoryResponse(
            success=True,
            history=history_items,
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

@router.post("/detect-video")
async def detect_plant_disease_video(
    file: UploadFile = File(...),
    confidence_threshold: Optional[float] = Form(0.25),
    frame_skip: Optional[int] = Form(5),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Process a video file for plant disease detection.
    Returns streaming response with progress updates.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="Please upload a valid video file")
        
        # Initialize video detector
        detector = VideoPlantDiseaseDetector(
            model_path=MODEL_PATH,
            conf_threshold=confidence_threshold
        )
        
        # Create directories
        upload_dir = "uploads/videos/detection"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filenames
        file_id = str(uuid.uuid4())
        input_filename = f"input_{file_id}_{file.filename}"
        # Force .mp4 extension for output to ensure browser compatibility
        base_name = os.path.splitext(file.filename)[0]
        output_filename = f"processed_{file_id}_{base_name}.mp4"
        
        input_path = os.path.join(upload_dir, input_filename)
        output_path = os.path.join(upload_dir, output_filename)
        
        # Save uploaded video
        file_content = await file.read()
        with open(input_path, "wb") as f:
            f.write(file_content)
        
        async def generate_progress():
            try:
                for progress_update in detector.process_video_file(input_path, output_path, frame_skip):
                    yield f"data: {json.dumps(progress_update)}\n\n"
                    await asyncio.sleep(0.1)  # Allow other tasks to run
            except Exception as e:
                error_update = {"status": "error", "error": str(e)}
                yield f"data: {json.dumps(error_update)}\n\n"
        
        return StreamingResponse(
            generate_progress(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@router.post("/detect-camera-frame")
async def detect_camera_frame(
    file: UploadFile = File(...),
    confidence_threshold: Optional[float] = Form(0.25),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Process a single camera frame for plant disease detection.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file")
        
        # Initialize video detector for frame processing
        detector = VideoPlantDiseaseDetector(
            model_path=MODEL_PATH,
            conf_threshold=confidence_threshold
        )
        
        # Read file content
        file_content = await file.read()
        
        # Process frame
        processed_bytes, detections = detector.process_frame_from_bytes(file_content)
        
        # Convert processed image to base64 for response
        processed_b64 = base64.b64encode(processed_bytes).decode('utf-8')
        
        # Create directories for saving (optional)
        upload_dir = "uploads/images/camera"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save to database (optional - for camera snapshots)
        file_id = str(uuid.uuid4())
        original_filename = f"camera_{file_id}_{file.filename}"
        processed_filename = f"processed_camera_{file_id}_{file.filename}"
        
        original_path = os.path.join(upload_dir, original_filename)
        processed_path = os.path.join(upload_dir, processed_filename)
        
        # Save files
        with open(original_path, "wb") as f:
            f.write(file_content)
        with open(processed_path, "wb") as f:
            f.write(processed_bytes)
        
        # Save to database
        detection_history = DetectionHistory(
            user_id=current_user.id,
            original_image_path=original_path,
            processed_image_path=processed_path,
            detections=detections,
            detection_count=len(detections),
            processing_time=0.0,  # Real-time, so minimal time
            confidence_threshold=confidence_threshold,
            success=True
        )
        
        db.add(detection_history)
        db.commit()
        db.refresh(detection_history)
        
        # Create alert if diseases are detected and user has pest_alerts enabled
        alert_created = None
        # Check if user has preferences and pest_alerts is enabled (default to True if preferences don't exist)
        pest_alerts_enabled = True  # Default value
        if current_user.preferences:
            pest_alerts_enabled = current_user.preferences.pest_alerts
        
        if pest_alerts_enabled:
            alert_created = create_detection_alert(
                db=db,
                user_id=current_user.id,
                detection_history_id=detection_history.id,
                detections=detections
            )
        
        return {
            "success": True,
            "message": "Camera frame processed successfully",
            "detection_id": detection_history.id,
            "detections": detections,
            "detection_count": len(detections),
            "processed_image_b64": processed_b64,
            "original_image_url": f"/uploads/images/camera/{original_filename}",
            "processed_image_url": f"/uploads/images/camera/{processed_filename}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing camera frame: {str(e)}")

@router.websocket("/stream-camera")
async def websocket_camera_stream(
    websocket: WebSocket,
    confidence_threshold: float = 0.25,
    camera_index: int = 0
):
    """
    WebSocket endpoint for real-time camera stream with disease detection.
    """
    await websocket.accept()
    
    try:
        # Initialize video detector
        detector = VideoPlantDiseaseDetector(
            model_path=MODEL_PATH,
            conf_threshold=confidence_threshold
        )
        
        # Start real-time processing
        for stream_update in detector.process_realtime_stream(camera_index):
            if stream_update["status"] == "detection":
                # Convert frame bytes to base64 for transmission
                frame_b64 = base64.b64encode(stream_update["frame_data"]).decode('utf-8')
                stream_update["frame_b64"] = frame_b64
                del stream_update["frame_data"]  # Remove binary data
            
            await websocket.send_text(json.dumps(stream_update))
            
            # Check for client disconnect
            try:
                message = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                if message == "stop":
                    detector.stop_stream()
                    break
            except asyncio.TimeoutError:
                pass  # No message received, continue
            except WebSocketDisconnect:
                detector.stop_stream()
                break
                
    except WebSocketDisconnect:
        detector.stop_stream()
    except Exception as e:
        await websocket.send_text(json.dumps({
            "status": "error",
            "error": str(e)
        }))
    finally:
        await websocket.close()


@router.get("/alerts", response_model=DetectionAlertResponse)
async def get_detection_alerts(
    skip: int = 0,
    limit: int = 20,
    unread_only: bool = False,
    include_dismissed: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user's detection alerts.
    """
    try:
        # Build query - exclude dismissed alerts by default unless requested
        query = db.query(DetectionAlert).filter(
            DetectionAlert.user_id == current_user.id
        )
        
        if not include_dismissed:
            query = query.filter(DetectionAlert.is_dismissed == False)
        
        if unread_only:
            query = query.filter(DetectionAlert.is_read == False)
        
        # Get total count
        total_count = query.count()
        
        # Get unread count (excluding dismissed)
        unread_count = db.query(DetectionAlert).filter(
            DetectionAlert.user_id == current_user.id,
            DetectionAlert.is_read == False,
            DetectionAlert.is_dismissed == False
        ).count()
        
        # Get alerts with pagination
        alerts = query.order_by(DetectionAlert.created_at.desc()).offset(skip).limit(limit).all()
        
        return DetectionAlertResponse(
            success=True,
            alerts=alerts,
            total_count=total_count,
            unread_count=unread_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")


@router.put("/alerts/{alert_id}/read")
async def mark_alert_as_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark an alert as read.
    """
    try:
        alert = db.query(DetectionAlert).filter(
            DetectionAlert.id == alert_id,
            DetectionAlert.user_id == current_user.id
        ).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        if not alert.is_read:
            alert.is_read = True
            alert.read_at = datetime.now()
            db.commit()
        
        return {"success": True, "message": "Alert marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating alert: {str(e)}")


@router.put("/alerts/{alert_id}/dismiss")
async def dismiss_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dismiss an alert.
    """
    try:
        alert = db.query(DetectionAlert).filter(
            DetectionAlert.id == alert_id,
            DetectionAlert.user_id == current_user.id
        ).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert.is_dismissed = True
        alert.dismissed_at = datetime.now()
        db.commit()
        
        return {"success": True, "message": "Alert dismissed"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error dismissing alert: {str(e)}")


@router.delete("/alerts/{alert_id}")
async def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an alert permanently.
    """
    try:
        alert = db.query(DetectionAlert).filter(
            DetectionAlert.id == alert_id,
            DetectionAlert.user_id == current_user.id
        ).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        db.delete(alert)
        db.commit()
        
        return {"success": True, "message": "Alert deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting alert: {str(e)}")


@router.put("/alerts/mark-all-read")
async def mark_all_alerts_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark all alerts as read for the current user.
    """
    try:
        # Update all unread alerts
        updated_count = db.query(DetectionAlert).filter(
            DetectionAlert.user_id == current_user.id,
            DetectionAlert.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.now()
        })
        
        db.commit()
        
        return {
            "success": True, 
            "message": f"Marked {updated_count} alerts as read"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating alerts: {str(e)}")


@router.get("/alerts/stats")
async def get_alert_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get alert statistics for the current user.
    """
    try:
        # Get various counts
        total_alerts = db.query(DetectionAlert).filter(
            DetectionAlert.user_id == current_user.id
        ).count()
        
        unread_alerts = db.query(DetectionAlert).filter(
            DetectionAlert.user_id == current_user.id,
            DetectionAlert.is_read == False
        ).count()
        
        high_severity_alerts = db.query(DetectionAlert).filter(
            DetectionAlert.user_id == current_user.id,
            DetectionAlert.severity == "high"
        ).count()
        
        # Get alert type distribution
        alert_types = db.query(
            DetectionAlert.alert_type,
            db.func.count(DetectionAlert.id).label('count')
        ).filter(
            DetectionAlert.user_id == current_user.id
        ).group_by(DetectionAlert.alert_type).all()
        
        alert_type_distribution = {alert_type: count for alert_type, count in alert_types}
        
        return {
            "success": True,
            "stats": {
                "total_alerts": total_alerts,
                "unread_alerts": unread_alerts,
                "high_severity_alerts": high_severity_alerts,
                "alert_type_distribution": alert_type_distribution
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alert stats: {str(e)}")
