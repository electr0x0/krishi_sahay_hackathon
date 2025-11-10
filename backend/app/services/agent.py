from typing import Annotated, TypedDict, Optional, Dict, Any, List
from datetime import datetime
import uuid
import time
import json

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from app.core.config import GOOGLE_API_KEY
from app.tools import (
    get_item_price, get_price_trend,
    get_current_weather, get_weather_forecast, get_weather_alerts,
    diagnose_crop_disease, get_crop_calendar, get_fertilizer_recommendation,
    get_latest_sensor_data, get_sensor_history, get_sensor_alerts,
    get_user_detection_history, get_detection_insights)

from app.tools.detection_tool import _get_user_detection_history_impl, _get_detection_insights_impl
from app.prompts.system_prompts import get_dialect_aware_prompt
from app.services.translation_service import translation_service
from app.services.dialect_service import dialect_service


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], lambda x, y: x + y]
    user_context: Dict[str, Any]
    session_id: str
    language: str


class EnhancedAgentService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.7
        )
        
        # All available tools
        self.tools = [
            get_item_price,
            get_price_trend,
            get_current_weather,
            get_weather_forecast,
            get_weather_alerts,
            diagnose_crop_disease,
            get_crop_calendar,
            get_fertilizer_recommendation,
            get_latest_sensor_data,
            get_sensor_history,
            get_sensor_alerts,
            get_user_detection_history,
            get_detection_insights
        ]
        
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        self.agent_graph = self._create_agent_graph()
    
    def _get_session_history(self, session_id: str, limit: int = 10) -> List[BaseMessage]:
        """Retrieve conversation history from database"""
        try:
            from app.database import get_db
            from app.models.chat import ChatSession, ChatMessage
            from sqlalchemy.orm import Session
            
            # Get database session
            db = next(get_db())
            
            # Get chat session
            session = db.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            
            if not session:
                return []
            
            # Get recent messages
            messages = db.query(ChatMessage).filter(
                ChatMessage.session_id == session.id
            ).order_by(ChatMessage.created_at.desc()).limit(limit * 2).all()
            
            # Convert to LangChain messages (reverse to chronological order)
            langchain_messages = []
            for msg in reversed(messages):
                if msg.role == "user":
                    langchain_messages.append(HumanMessage(content=msg.content))
                elif msg.role == "assistant":
                    langchain_messages.append(AIMessage(content=msg.content))
            
            db.close()
            return langchain_messages[-limit:] if langchain_messages else []
            
        except Exception as e:
            print(f"Error retrieving session history: {e}")
            return []
    
    def _create_agent_graph(self):
        """Create the agent graph with state management"""
        
        def agent_node(state: AgentState):
            # Get language and dialect from state
            language = state.get("language", "bn")
            user_context = state.get("user_context", {})
            dialect = user_context.get("dialect") or user_context.get("preferred_dialect")
            
            # Get dialect-aware system prompt
            system_prompt = get_dialect_aware_prompt(
                language=language,
                dialect=dialect,
                user_context=user_context
            )
            
            # Enhanced instructions for flexible response
            location_info = ""
            if user_context.get("location"):
                loc = user_context["location"]
                if loc.get("district"):
                    location_info = f"\n📍 USER LOCATION: The user is from {loc['district']} district."
                    if loc.get("lat") and loc.get("lon"):
                        location_info += f" Coordinates: {loc['lat']}, {loc['lon']}"
                    location_info += "\n- When asking for weather, prices, or location-specific info, you already have their location."
                    location_info += "\n- DO NOT ask the user for their location - use the weather tools without location parameter."
            
            enhanced_prompt = f"""{system_prompt}
{location_info}

RESPONSE FLEXIBILITY GUIDELINES:
🔧 Tool Usage Strategy:
- Use specialized tools when you need real-time data (weather, prices, disease diagnosis)
- For weather queries, you already have the user's location - call the tool directly
- Don't ask users for location when you already have it in the context
- Don't force tool usage for general agricultural knowledge questions
- Combine tool data with your expertise for comprehensive answers

🧠 Knowledge-Based Responses:
- Answer directly from your agricultural knowledge when appropriate
- Provide practical farming advice using your expertise
- Share traditional and modern farming techniques
- Explain agricultural concepts, crop management, etc.

🎯 Decision Framework:
- Need current weather? → Use weather tools (location already available)
- Need market prices? → Use pricing tools  
- Need disease diagnosis? → Use crop tools
- General farming advice? → Use your knowledge directly
- Complex questions? → Combine tools + knowledge

🗣️ Context Awareness:
- Remember previous conversations in this session
- Build upon previous discussions
- Reference earlier questions and answers when relevant
- Maintain continuity in advice and recommendations

Always prioritize helpful, practical advice for Bangladeshi farmers."""
            
            # Get session history for context
            session_id = state.get("session_id")
            history_messages = []
            if session_id:
                history_messages = self._get_session_history(session_id, limit=8)
            
            # Prepare messages with history + current message
            all_messages = [SystemMessage(content=enhanced_prompt)]
            if history_messages:
                all_messages.extend(history_messages)
            all_messages.extend(state["messages"])
            
            # Get response from LLM
            response = self.llm_with_tools.invoke(all_messages)
            
            return {"messages": [response]}
        
        def custom_tool_node(state: AgentState):
            """Custom tool execution that provides user context to detection tools and location to weather tools"""
            messages = state.get("messages", [])
            user_context = state.get("user_context", {})
            user_id = user_context.get("user_id")
            user_location = user_context.get("location", {})
            
            # Find the last AI message with tool calls
            last_message = messages[-1] if messages else None
            if not last_message or not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
                return {"messages": []}
            
            # Weather tools that need location data
            weather_tools = ["get_current_weather", "get_weather_forecast", "get_weather_alerts"]
            
            # Check if any tool calls need special handling
            has_detection_tools = any(
                tool_call["name"] in ["get_user_detection_history", "get_detection_insights"] 
                for tool_call in last_message.tool_calls
            )
            
            has_weather_tools = any(
                tool_call["name"] in weather_tools
                for tool_call in last_message.tool_calls
            )
            
            if (has_detection_tools and user_id) or (has_weather_tools and user_location):
                # Handle detection tools manually with user context
                tool_results = []
                
                for tool_call in last_message.tool_calls:
                    tool_name = tool_call["name"]
                    tool_args = tool_call.get("args", {})
                    
                    try:
                        # Handle detection tools with user_id
                        if tool_name == "get_user_detection_history":
                            limit = tool_args.get("limit", 5)
                            result = _get_user_detection_history_impl(user_id, limit)
                        elif tool_name == "get_detection_insights":
                            result = _get_detection_insights_impl(user_id)
                        # Handle weather tools with user location
                        elif tool_name in weather_tools:
                            # Inject user's location if not provided in the tool call
                            if not tool_args.get("lat") and not tool_args.get("location"):
                                if user_location.get("lat") and user_location.get("lon"):
                                    tool_args["lat"] = user_location["lat"]
                                    tool_args["lon"] = user_location["lon"]
                                elif user_location.get("district"):
                                    tool_args["location"] = user_location["district"]
                            
                            # Find and execute the weather tool
                            tool_func = None
                            for tool in self.tools:
                                if tool.name == tool_name:
                                    tool_func = tool
                                    break
                            
                            if tool_func:
                                result = tool_func.invoke(tool_args)
                            else:
                                result = f"Tool {tool_name} not found"
                        else:
                            # For non-detection tools, still need to execute them manually
                            # Find the tool function and execute it
                            tool_func = None
                            for tool in self.tools:
                                if tool.name == tool_name:
                                    tool_func = tool
                                    break
                            
                            if tool_func:
                                result = tool_func.invoke(tool_args)
                            else:
                                result = f"Tool {tool_name} not found"
                        
                        from langchain_core.messages import ToolMessage
                        tool_message = ToolMessage(
                            content=result,
                            tool_call_id=tool_call["id"]
                        )
                        tool_results.append(tool_message)
                        
                    except Exception as e:
                        # Handle tool execution errors
                        from langchain_core.messages import ToolMessage
                        error_message = ToolMessage(
                            content=f"Error executing {tool_name}: {str(e)}",
                            tool_call_id=tool_call["id"]
                        )
                        tool_results.append(error_message)
                
                return {"messages": tool_results}
            else:
                # Use standard tool execution for non-detection tools
                tool_node = ToolNode(self.tools)
                return tool_node.invoke(state)
        
        # Create graph
        graph = StateGraph(AgentState)
        graph.add_node("agent", agent_node)
        graph.add_node("tools", custom_tool_node)
        graph.set_entry_point("agent")
        
        # Conditional edges
        graph.add_conditional_edges(
            "agent",
            lambda x: "tools" if x["messages"][-1].tool_calls else END,
        )
        graph.add_edge("tools", "agent")
        
        return graph.compile()
    
    def _build_components_from_tools(self, tool_calls: List[Dict], tool_outputs: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Build interactive UI components from tool outputs"""
        components = []
        
        for tool_call in tool_calls:
            tool_name = tool_call.get("name", "")
            tool_data = tool_outputs.get(tool_name)
            
            if not tool_data:
                continue
            
            # Parse tool data if it's a string
            if isinstance(tool_data, str):
                try:
                    tool_data = json.loads(tool_data)
                except json.JSONDecodeError:
                    # If it's plain text, wrap it
                    tool_data = {"text": tool_data}
            
            # Weather Forecast Component
            if tool_name == "get_weather_forecast":
                components.append({
                    "type": "weather_forecast",
                    "data": tool_data,
                    "actions": [
                        {"label": "সেচ করার সময়সূচী যোগ করুন", "action": "schedule_irrigation", "icon": "droplet"},
                        {"label": "বিস্তারিত রিপোর্ট দেখুন", "action": "view_weather_details", "icon": "file-text"}
                    ]
                })
            
            # Current Weather Component
            elif tool_name == "get_current_weather":
                components.append({
                    "type": "current_weather",
                    "data": tool_data,
                    "actions": [
                        {"label": "আবহাওয়া সতর্কতা সেট করুন", "action": "set_weather_alert", "icon": "bell"},
                        {"label": "৭-দিনের পূর্বাভাস দেখুন", "action": "view_7day_forecast", "icon": "calendar"}
                    ]
                })
            
            # Disease Detection Component
            elif tool_name == "diagnose_crop_disease":
                components.append({
                    "type": "disease_detection",
                    "data": tool_data,
                    "actions": [
                        {"label": "চিকিৎসা কিনুন", "action": "buy_treatment", "icon": "shopping-cart"},
                        {"label": "বিশেষজ্ঞের সাথে যোগাযোগ করুন", "action": "contact_expert", "icon": "phone"},
                        {"label": "একই সমস্যার অন্যদের দেখুন", "action": "view_similar_cases", "icon": "users"}
                    ]
                })
            
            # Market Price Component
            elif tool_name in ["get_item_price", "get_price_trend"]:
                components.append({
                    "type": "market_price",
                    "data": tool_data,
                    "actions": [
                        {"label": "বিক্রয়ের জন্য তালিকাভুক্ত করুন", "action": "list_for_sale", "icon": "tag"},
                        {"label": "মূল্য সতর্কতা সেট করুন", "action": "set_price_alert", "icon": "bell"},
                        {"label": "বাজারের প্রবণতা দেখুন", "action": "view_price_trend", "icon": "trending-up"}
                    ]
                })
            
            # IoT Sensor Data Component
            elif tool_name in ["get_latest_sensor_data", "get_sensor_history"]:
                components.append({
                    "type": "sensor_data",
                    "data": tool_data,
                    "actions": [
                        {"label": "সীমা সতর্কতা সেট করুন", "action": "set_threshold_alert", "icon": "alert-triangle"},
                        {"label": "ঐতিহাসিক ডেটা দেখুন", "action": "view_sensor_history", "icon": "bar-chart"},
                        {"label": "সেন্সর কনফিগার করুন", "action": "configure_sensor", "icon": "settings"}
                    ]
                })
            
            # Sensor Alerts Component
            elif tool_name == "get_sensor_alerts":
                components.append({
                    "type": "sensor_alerts",
                    "data": tool_data,
                    "actions": [
                        {"label": "সব পরীক্ষা করা হিসাবে চিহ্নিত করুন", "action": "mark_all_read", "icon": "check-circle"},
                        {"label": "জরুরী সতর্কতা দেখুন", "action": "view_critical_only", "icon": "alert-circle"}
                    ]
                })
            
            # Crop Calendar Component
            elif tool_name == "get_crop_calendar":
                components.append({
                    "type": "crop_calendar",
                    "data": tool_data,
                    "actions": [
                        {"label": "ক্যালেন্ডারে যোগ করুন", "action": "add_to_calendar", "icon": "calendar-plus"},
                        {"label": "অনুস্মারক সেট করুন", "action": "set_reminders", "icon": "bell"},
                        {"label": "PDF ডাউনলোড করুন", "action": "download_calendar_pdf", "icon": "download"}
                    ]
                })
            
            # Fertilizer Recommendation Component
            elif tool_name == "get_fertilizer_recommendation":
                components.append({
                    "type": "fertilizer_recommendation",
                    "data": tool_data,
                    "actions": [
                        {"label": "সার কিনুন", "action": "buy_fertilizer", "icon": "shopping-cart"},
                        {"label": "ডোজ ক্যালকুলেটর", "action": "calculate_dosage", "icon": "calculator"},
                        {"label": "এজেন্ডায় যোগ করুন", "action": "add_to_agenda", "icon": "list-plus"}
                    ]
                })
            
            # Detection History/Insights Component
            elif tool_name in ["get_user_detection_history", "get_detection_insights"]:
                components.append({
                    "type": "detection_insights",
                    "data": tool_data,
                    "actions": [
                        {"label": "বিস্তারিত রিপোর্ট দেখুন", "action": "view_detailed_report", "icon": "file-text"},
                        {"label": "PDF রপ্তানি করুন", "action": "export_pdf", "icon": "download"},
                        {"label": "সুপারিশ পান", "action": "get_recommendations", "icon": "lightbulb"}
                    ]
                })
        
        return components
    
    async def process_message(
        self,
        message: str,
        user_context: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        language: str = "bn",
        dialect: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process user message with context and dialect awareness
        
        Args:
            message: User's message
            user_context: User information and preferences
            session_id: Chat session ID
            language: Base language (bn/en/hi/ur)
            dialect: Specific dialect (bn-syl/bn-ctg/bn-noa/bn-ran)
            
        Returns:
            Response with translated content if needed
        """
        start_time = time.time()
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if not user_context:
            user_context = {}
        
        # Auto-detect dialect if enabled
        if user_context.get("auto_detect_dialect", True) or language == "auto":
            detection_result = dialect_service.auto_detect_and_normalize(
                text=message,
                user_context=user_context
            )
            
            detected_dialect = detection_result["detected_dialect"]
            normalized_message = detection_result["normalized_text"]
            detection_confidence = detection_result["confidence"]
            
            # Use detected dialect if not explicitly provided
            if not dialect:
                dialect = detected_dialect
            
            # Update language based on detection
            if language == "auto":
                language = detection_result["base_language"]
        else:
            normalized_message = message
            detection_confidence = 1.0
        
        # Store dialect in user context
        user_context["dialect"] = dialect
        user_context["detected_dialect"] = dialect
        user_context["detection_confidence"] = detection_confidence
        
        # Create agent state
        state = {
            "messages": [HumanMessage(content=normalized_message)],
            "user_context": user_context,
            "session_id": session_id,
            "language": language
        }
        
        try:
            # Run agent
            result = self.agent_graph.invoke(state)
            
            # Extract response and tool information
            response_message = result["messages"][-1]
            response_content = response_message.content
            
            # Handle Gemini's structured content format
            if isinstance(response_content, list):
                # Extract text from content blocks
                text_content = ""
                for block in response_content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_content += block.get("text", "")
                response_content = text_content if text_content else str(response_content)
            
            # Collect tool calls and outputs from all messages
            tool_calls = []
            tool_outputs = {}
            
            for msg in result["messages"]:
                if hasattr(msg, 'tool_calls') and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        tool_calls.append({
                            "name": tool_call.get("name", ""),
                            "args": tool_call.get("args", {}),
                            "id": tool_call.get("id", "")
                        })
                
                # Extract tool outputs from tool messages
                if hasattr(msg, 'content') and isinstance(msg.content, str):
                    # Check if this is a tool response message
                    try:
                        # Tool messages might contain structured data
                        if msg.content.startswith('{') and msg.content.endswith('}'):
                            tool_data = json.loads(msg.content)
                            if isinstance(tool_data, dict):
                                # Try to identify the tool from the content
                                for tool_call in tool_calls:
                                    tool_name = tool_call.get("name", "")
                                    if tool_name and tool_name not in tool_outputs:
                                        tool_outputs[tool_name] = tool_data
                                        break
                    except (json.JSONDecodeError, AttributeError):
                        pass
            
            # If we have tool calls but no outputs captured, try to extract from function calls
            if tool_calls and not tool_outputs:
                # Execute tools to get their outputs for storage
                for tool_call in tool_calls:
                    tool_name = tool_call.get("name", "")
                    tool_args = tool_call.get("args", {})
                    
                    try:
                        # Find and execute the tool
                        for tool in self.tools:
                            if tool.name == tool_name:
                                tool_result = tool.invoke(tool_args)
                                tool_outputs[tool_name] = tool_result
                                break
                    except Exception as e:
                        print(f"Error executing tool {tool_name}: {e}")
                        tool_outputs[tool_name] = {"error": str(e)}
            
            # Translate response if needed (convert to user's dialect)
            if dialect and user_context.get("auto_translate_response", True):
                final_response = dialect_service.prepare_response_in_dialect(
                    ai_response=response_content,
                    user_dialect=dialect,
                    include_metadata=False
                )
            else:
                final_response = response_content
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Build interactive components from tool outputs
            components = self._build_components_from_tools(tool_calls, tool_outputs)
            
            # Prepare response
            response = {
                "content": final_response,
                "session_id": session_id,
                "language": language,
                "dialect": dialect,
                "detected_dialect": dialect,
                "detection_confidence": detection_confidence,
                "timestamp": datetime.now().isoformat(),
                "tool_calls": tool_calls,
                "tool_outputs": tool_outputs,
                "components": components,  # NEW: Interactive components
                "processing_time": processing_time,
                "success": True
            }
            
            return response
            
        except Exception as e:
            processing_time = time.time() - start_time
            
            # Print full error details for debugging
            import traceback
            print(f"\n{'='*60}")
            print(f"ERROR in process_message:")
            print(f"Error Type: {type(e).__name__}")
            print(f"Error Message: {str(e)}")
            print(f"Traceback:")
            traceback.print_exc()
            print(f"{'='*60}\n")
            
            error_message = "দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" if language == "bn" else "Sorry, an error occurred. Please try again."
            
            return {
                "content": error_message,
                "session_id": session_id,
                "language": language,
                "timestamp": datetime.now().isoformat(),
                "processing_time": processing_time,
                "error": str(e),
                "success": False
            }


# Global agent instance
enhanced_agent = EnhancedAgentService()


def create_agent():
    """Legacy function for backward compatibility"""
    return enhanced_agent.agent_graph


async def run_enhanced_agent(
    query: str,
    user_context: Optional[Dict[str, Any]] = None,
    session_id: Optional[str] = None,
    language: str = "bn",
    dialect: Optional[str] = None
) -> Dict[str, Any]:
    """
    Enhanced agent runner with dialect awareness
    
    Args:
        query: User query
        user_context: User context and preferences
        session_id: Chat session ID
        language: Base language code
        dialect: Dialect code
    """
    return await enhanced_agent.process_message(
        message=query,
        user_context=user_context,
        session_id=session_id,
        language=language,
        dialect=dialect
    )


def run_agent(agent, query: str):
    """Legacy function for backward compatibility"""
    state = {
        "messages": [HumanMessage(content=query)],
        "user_context": {},
        "session_id": str(uuid.uuid4()),
        "language": "bn"
    }
    return agent.invoke(state)