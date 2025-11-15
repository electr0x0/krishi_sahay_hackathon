"""
IoT Threshold Monitoring Service

Monitors sensor data against user-defined thresholds and sends notifications.
"""

from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.threshold import (
    SensorThreshold, ThresholdNotification, 
    ThresholdType, ThresholdStatus, NotificationChannel
)
from app.models.sensor import SensorData
from app.services.twilio_service import twilio_service


class ThresholdMonitorService:
    """Service for monitoring sensor thresholds and sending alerts"""
    
    # Mapping of sensor data fields to threshold sensor types
    SENSOR_FIELD_MAPPING = {
        "temperature": "temperature_c",
        "humidity": "humidity_percent",
        "soil_moisture": "soil_moisture_percent",
        "water_level": "water_level_percent",
        "heat_index": "heat_index_c"
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_thresholds_for_user(
        self, 
        user_id: int, 
        sensor_data: Dict,
        sensor_data_id: Optional[int] = None
    ) -> List[Dict]:
        """
        Check all active thresholds for a user against new sensor data
        
        Args:
            user_id: User ID
            sensor_data: Dictionary with sensor readings
            sensor_data_id: Optional sensor data record ID
        
        Returns:
            List of check results with notification status
        """
        results = []
        
        # Get all active thresholds for user
        thresholds = self.db.query(SensorThreshold).filter(
            SensorThreshold.user_id == user_id,
            SensorThreshold.enabled == True,
            SensorThreshold.status != ThresholdStatus.INACTIVE
        ).all()
        
        for threshold in thresholds:
            result = self._check_single_threshold(
                threshold, 
                sensor_data,
                sensor_data_id
            )
            results.append(result)
        
        return results
    
    def _check_single_threshold(
        self, 
        threshold: SensorThreshold, 
        sensor_data: Dict,
        sensor_data_id: Optional[int]
    ) -> Dict:
        """Check a single threshold against sensor data"""
        
        # Get sensor value from data
        sensor_field = self.SENSOR_FIELD_MAPPING.get(threshold.sensor_type)
        if not sensor_field or sensor_field not in sensor_data:
            return {
                "threshold_id": threshold.id,
                "alert_name": threshold.alert_name,
                "sensor_type": threshold.sensor_type,
                "is_triggered": False,
                "notification_sent": False,
                "reason": f"Sensor data not available for {threshold.sensor_type}"
            }
        
        sensor_value = sensor_data[sensor_field]
        is_triggered = threshold.is_triggered(sensor_value)
        
        # Prepare result
        result = {
            "threshold_id": threshold.id,
            "alert_name": threshold.alert_name,
            "sensor_type": threshold.sensor_type,
            "is_triggered": is_triggered,
            "sensor_value": sensor_value,
            "threshold_value": threshold.threshold_value,
            "notification_sent": False,
            "reason": None
        }
        
        if not is_triggered:
            # Reset status if it was triggered before
            if threshold.status == ThresholdStatus.TRIGGERED:
                threshold.status = ThresholdStatus.ACTIVE
                self.db.commit()
            
            result["reason"] = "Threshold not breached"
            return result
        
        # Threshold is triggered - check if we should send notification
        if not threshold.can_send_notification():
            result["reason"] = f"Cooldown active (wait {threshold.cooldown_minutes} minutes between alerts)"
            return result
        
        # Send notification
        notification_sent = self._send_threshold_notification(
            threshold=threshold,
            sensor_value=sensor_value,
            sensor_data_id=sensor_data_id
        )
        
        result["notification_sent"] = notification_sent
        
        if notification_sent:
            # Update threshold status
            threshold.status = ThresholdStatus.TRIGGERED
            threshold.last_triggered_at = datetime.utcnow()
            threshold.trigger_count += 1
            self.db.commit()
            result["reason"] = "Notification sent successfully"
        else:
            result["reason"] = "Failed to send notification"
        
        return result
    
    def _send_threshold_notification(
        self,
        threshold: SensorThreshold,
        sensor_value: float,
        sensor_data_id: Optional[int]
    ) -> bool:
        """
        Send threshold breach notification via configured channels
        
        Returns:
            True if at least one notification sent successfully
        """
        success = False
        delivery_status = {}
        twilio_sid = None
        message = self._format_threshold_message(threshold, sensor_value)
        
        # Send via configured channels
        for channel in threshold.notification_channels:
            if channel == "whatsapp" or channel == NotificationChannel.WHATSAPP:
                # Send WhatsApp notification via Twilio
                try:
                    sid = twilio_service.send_custom_message(message)
                    if sid:
                        delivery_status["whatsapp"] = "sent"
                        twilio_sid = sid
                        success = True
                    else:
                        delivery_status["whatsapp"] = "failed"
                except Exception as e:
                    delivery_status["whatsapp"] = f"error: {str(e)}"
                    print(f"❌ WhatsApp notification failed: {e}")
            
            elif channel == "email" or channel == NotificationChannel.EMAIL:
                # TODO: Implement email notifications
                delivery_status["email"] = "not_implemented"
            
            elif channel == "sms" or channel == NotificationChannel.SMS:
                # TODO: Implement SMS notifications
                delivery_status["sms"] = "not_implemented"
            
            elif channel == "in_app" or channel == NotificationChannel.IN_APP:
                # In-app notifications are handled separately (real-time updates)
                delivery_status["in_app"] = "queued"
                success = True
        
        # Save notification history
        notification = ThresholdNotification(
            user_id=threshold.user_id,
            threshold_id=threshold.id,
            sensor_data_id=sensor_data_id,
            sensor_type=threshold.sensor_type,
            sensor_value=sensor_value,
            threshold_value=threshold.threshold_value,
            threshold_type=threshold.threshold_type.value if hasattr(threshold.threshold_type, 'value') else str(threshold.threshold_type),
            channels=[str(c) if hasattr(c, 'value') else c for c in threshold.notification_channels],
            message_sent=message,
            delivery_status=delivery_status,
            twilio_message_sid=twilio_sid,
            success=success,
            error_message=None if success else "All notification channels failed"
        )
        
        self.db.add(notification)
        self.db.commit()
        
        return success
    
    def _format_threshold_message(
        self, 
        threshold: SensorThreshold, 
        sensor_value: float
    ) -> str:
        """Format WhatsApp message for threshold breach"""
        
        # Sensor type display names in Bengali
        sensor_names = {
            "temperature": "তাপমাত্রা 🌡️",
            "humidity": "আর্দ্রতা 💧",
            "soil_moisture": "মাটির আর্দ্রতা 🌱",
            "water_level": "পানির স্তর 💧",
            "heat_index": "তাপ সূচক 🔥"
        }
        
        # Sensor units
        sensor_units = {
            "temperature": "°C",
            "humidity": "%",
            "soil_moisture": "%",
            "water_level": "%",
            "heat_index": "°C"
        }
        
        # Severity emojis
        severity_emojis = {
            "low": "🟢",
            "medium": "🟡",
            "high": "🟠",
            "critical": "🔴"
        }
        
        sensor_name = sensor_names.get(threshold.sensor_type, threshold.sensor_type)
        sensor_unit = sensor_units.get(threshold.sensor_type, "")
        severity_emoji = severity_emojis.get(threshold.severity, "⚠️")
        
        # Build message
        now = datetime.now()
        message = f"{severity_emoji} *কৃষি সহায় - সেন্সর সতর্কতা* {severity_emoji}\n\n"
        message += f"⚠️ *{threshold.alert_name}*\n\n"
        
        # Threshold details
        message += f"📊 *সেন্সর ডেটা*:\n"
        message += f"   {sensor_name}: *{sensor_value:.1f}{sensor_unit}*\n\n"
        
        # Threshold condition
        if threshold.threshold_type == ThresholdType.ABOVE:
            message += f"🔺 *সীমা অতিক্রম*: {threshold.threshold_value:.1f}{sensor_unit} এর উপরে\n"
        elif threshold.threshold_type == ThresholdType.BELOW:
            message += f"🔻 *সীমার নিচে*: {threshold.threshold_value:.1f}{sensor_unit} এর নিচে\n"
        elif threshold.threshold_type == ThresholdType.RANGE:
            message += f"📏 *স্বাভাবিক সীমা*: {threshold.min_value:.1f} - {threshold.max_value:.1f}{sensor_unit}\n"
        
        message += f"\n"
        
        # Alert description
        if threshold.alert_description:
            message += f"📝 *বিবরণ*: {threshold.alert_description}\n\n"
        
        # Custom message if provided
        if threshold.notification_message:
            message += f"💡 *পরামর্শ*: {threshold.notification_message}\n\n"
        
        # Timestamp
        message += f"⏰ সময়: {now.strftime('%d/%m/%Y %I:%M %p')}\n\n"
        
        # Action
        message += f"📱 বিস্তারিত দেখতে অ্যাপ খুলুন\n"
        message += f"🔗 http://localhost:3000/dashboard/notifications\n\n"
        message += f"🔔 *নোট*: পরবর্তী সতর্কতা {threshold.cooldown_minutes} মিনিট পরে পাঠানো হবে।"
        
        return message
    
    def get_notification_history(
        self,
        user_id: int,
        limit: int = 20,
        skip: int = 0,
        threshold_id: Optional[int] = None
    ) -> Tuple[List[ThresholdNotification], int]:
        """Get notification history for a user"""
        query = self.db.query(ThresholdNotification).filter(
            ThresholdNotification.user_id == user_id
        )
        
        if threshold_id:
            query = query.filter(ThresholdNotification.threshold_id == threshold_id)
        
        total_count = query.count()
        
        notifications = query.order_by(
            ThresholdNotification.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return notifications, total_count
    
    def get_threshold_summary(self, user_id: int) -> Dict:
        """Get summary of threshold status"""
        thresholds = self.db.query(SensorThreshold).filter(
            SensorThreshold.user_id == user_id
        ).all()
        
        # Count notifications in last 24 hours
        yesterday = datetime.utcnow() - timedelta(hours=24)
        recent_notifications = self.db.query(ThresholdNotification).filter(
            ThresholdNotification.user_id == user_id,
            ThresholdNotification.created_at >= yesterday
        ).count()
        
        # Total notifications
        total_notifications = self.db.query(ThresholdNotification).filter(
            ThresholdNotification.user_id == user_id
        ).count()
        
        return {
            "total_thresholds": len(thresholds),
            "active_thresholds": sum(1 for t in thresholds if t.enabled),
            "triggered_thresholds": sum(1 for t in thresholds if t.status == ThresholdStatus.TRIGGERED),
            "total_notifications_sent": total_notifications,
            "last_24h_notifications": recent_notifications
        }


# Helper function to create service instance
def get_threshold_monitor(db: Session) -> ThresholdMonitorService:
    """Get threshold monitor service instance"""
    return ThresholdMonitorService(db)

