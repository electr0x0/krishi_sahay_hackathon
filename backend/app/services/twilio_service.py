"""
Twilio WhatsApp Notification Service

Sends WhatsApp notifications for disease detection alerts in Bengali.
"""

import os
from typing import Optional, Dict, List
from twilio.rest import Client
from datetime import datetime


class TwilioWhatsAppService:
    """Service for sending WhatsApp notifications via Twilio"""
    
    def __init__(self):
        # Get credentials from environment variables
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID", "ACdfc83a4b0b853dc0093b666993ae1c28")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
        self.default_to_number = os.getenv("TWILIO_WHATSAPP_TO", "whatsapp:+8801773666439")
        
        # Initialize client if auth token is available
        self.client = None
        if self.auth_token:
            try:
                self.client = Client(self.account_sid, self.auth_token)
                print("✅ Twilio WhatsApp service initialized successfully")
            except Exception as e:
                print(f"❌ Failed to initialize Twilio client: {e}")
        else:
            print("⚠️ TWILIO_AUTH_TOKEN not found. WhatsApp notifications disabled.")
    
    def is_enabled(self) -> bool:
        """Check if Twilio service is properly configured"""
        return self.client is not None
    
    def send_disease_detection_alert(
        self,
        detection_id: int,
        diseases: List[Dict],
        plant_health_score: Optional[float] = None,
        growth_stage: Optional[str] = None,
        severity: Optional[str] = None,
        to_number: Optional[str] = None
    ) -> Optional[str]:
        """
        Send disease detection alert via WhatsApp
        
        Args:
            detection_id: ID of the detection record
            diseases: List of detected diseases with confidence
            plant_health_score: AI-calculated health score (0-100)
            growth_stage: Growth stage in Bengali
            severity: Severity assessment
            to_number: Optional recipient number (defaults to configured number)
        
        Returns:
            Message SID if successful, None if failed
        """
        if not self.is_enabled():
            print("⚠️ Twilio service not enabled. Skipping notification.")
            return None
        
        try:
            # Prepare the message
            message_body = self._format_disease_alert(
                detection_id=detection_id,
                diseases=diseases,
                plant_health_score=plant_health_score,
                growth_stage=growth_stage,
                severity=severity
            )
            
            # Send message
            recipient = to_number or self.default_to_number
            message = self.client.messages.create(
                from_=self.from_number,
                body=message_body,
                to=recipient
            )
            
            print(f"✅ WhatsApp alert sent successfully! SID: {message.sid}")
            return message.sid
            
        except Exception as e:
            print(f"❌ Failed to send WhatsApp alert: {e}")
            return None
    
    def send_template_message(
        self,
        content_sid: str,
        content_variables: Dict[str, str],
        to_number: Optional[str] = None
    ) -> Optional[str]:
        """
        Send WhatsApp message using Twilio Content Template
        
        Args:
            content_sid: Twilio content template SID
            content_variables: Template variables as dict
            to_number: Optional recipient number
        
        Returns:
            Message SID if successful, None if failed
        """
        if not self.is_enabled():
            print("⚠️ Twilio service not enabled. Skipping notification.")
            return None
        
        try:
            recipient = to_number or self.default_to_number
            
            # Convert dict to JSON string for content_variables
            import json
            variables_json = json.dumps(content_variables)
            
            message = self.client.messages.create(
                from_=self.from_number,
                content_sid=content_sid,
                content_variables=variables_json,
                to=recipient
            )
            
            print(f"✅ WhatsApp template message sent! SID: {message.sid}")
            return message.sid
            
        except Exception as e:
            print(f"❌ Failed to send template message: {e}")
            return None
    
    def _format_disease_alert(
        self,
        detection_id: int,
        diseases: List[Dict],
        plant_health_score: Optional[float],
        growth_stage: Optional[str],
        severity: Optional[str]
    ) -> str:
        """Format disease detection alert in Bengali"""
        
        # Header with emoji
        now = datetime.now()
        date_str = now.strftime("%d/%m/%Y")
        time_str = now.strftime("%I:%M %p")
        
        message = f"🌾 *কৃষি সহায় - রোগ সনাক্তকরণ সতর্কতা* 🌾\n\n"
        message += f"📅 তারিখ: {date_str}\n"
        message += f"⏰ সময়: {time_str}\n"
        message += f"🔍 সনাক্তকরণ ID: #{detection_id}\n\n"
        
        # Disease information
        if diseases and len(diseases) > 0:
            message += f"⚠️ *সনাক্তকৃত রোগ* ({len(diseases)}টি):\n"
            for i, disease in enumerate(diseases[:3], 1):  # Show top 3
                disease_name = disease.get('disease_name', 'অজানা রোগ')
                confidence = disease.get('confidence', 0) * 100
                message += f"{i}. {disease_name}\n   নিশ্চিততা: {confidence:.1f}%\n"
            
            if len(diseases) > 3:
                message += f"   ... এবং আরও {len(diseases) - 3}টি\n"
            message += "\n"
        else:
            message += "✅ কোনো রোগ সনাক্ত করা হয়নি\n\n"
        
        # Health score
        if plant_health_score is not None:
            health_emoji = "🟢" if plant_health_score >= 70 else "🟡" if plant_health_score >= 40 else "🔴"
            message += f"{health_emoji} *স্বাস্থ্য স্কোর*: {plant_health_score:.1f}%\n"
        
        # Growth stage
        if growth_stage:
            message += f"🌱 *বৃদ্ধির পর্যায়*: {growth_stage}\n"
        
        # Severity
        if severity:
            severity_emoji = "🔴" if "গুরুতর" in severity or "মারাত্মক" in severity else "🟡" if "মাঝারি" in severity else "🟢"
            message += f"{severity_emoji} *তীব্রতা*: {severity}\n"
        
        # Footer with action
        message += f"\n📱 বিস্তারিত দেখতে অ্যাপ খুলুন\n"
        message += f"🔗 http://localhost:3000/dashboard/detection\n\n"
        message += "💡 *পরামর্শ*: দ্রুত চিকিৎসা শুরু করুন এবং নিয়মিত পর্যবেক্ষণ করুন।"
        
        return message
    
    def send_custom_message(
        self,
        message: str,
        to_number: Optional[str] = None
    ) -> Optional[str]:
        """
        Send a custom WhatsApp message
        
        Args:
            message: Message body
            to_number: Optional recipient number
        
        Returns:
            Message SID if successful, None if failed
        """
        if not self.is_enabled():
            print("⚠️ Twilio service not enabled. Skipping notification.")
            return None
        
        try:
            recipient = to_number or self.default_to_number
            
            sent_message = self.client.messages.create(
                from_=self.from_number,
                body=message,
                to=recipient
            )
            
            print(f"✅ Custom WhatsApp message sent! SID: {sent_message.sid}")
            return sent_message.sid
            
        except Exception as e:
            print(f"❌ Failed to send custom message: {e}")
            return None


# Singleton instance
twilio_service = TwilioWhatsAppService()

