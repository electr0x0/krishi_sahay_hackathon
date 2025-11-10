from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.agent import run_enhanced_agent
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

class AgentQuery(BaseModel):
    query: str
    session_id: Optional[str] = None
    language: Optional[str] = "bn"
    user_context: Optional[Dict[str, Any]] = None

@router.post("/invoke")
async def invoke_agent(
    query: AgentQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Invoke the AI agent with user context including location data.
    This ensures weather tools and other location-based tools work properly.
    """
    # Build user context with location from user profile
    user_context = query.user_context or {}
    
    # Ensure location data is included from the authenticated user
    if not user_context.get("location"):
        user_context["location"] = {
            "district": current_user.district,
            "lat": current_user.latitude,
            "lon": current_user.longitude
        }
    
    # Add user_id and language preferences
    user_context["user_id"] = current_user.id
    user_context["language"] = query.language
    user_context["preferred_dialect"] = getattr(current_user, 'preferred_dialect', None)
    user_context["region"] = getattr(current_user, 'region', None)
    
    # Run enhanced agent with full user context
    result = await run_enhanced_agent(
        query=query.query,
        user_context=user_context,
        session_id=query.session_id,
        language=query.language
    )
    
    return result
