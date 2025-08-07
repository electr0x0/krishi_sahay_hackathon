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
    get_latest_sensor_data, get_sensor_history, get_sensor_alerts
)
from app.prompts.system_prompts import get_system_prompt, get_context_prompt
from app.services.translation_service import translation_service


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
            get_sensor_alerts
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
            # Get system prompt based on language
            language = state.get("language", "bn")
            system_prompt = get_system_prompt(language)
            
            # Add user context if available
            user_context = state.get("user_context", {})
            if user_context:
                context_prompt = get_context_prompt(user_context)
                system_prompt += "\n\n" + context_prompt
            
            # Enhanced instructions for flexible response
            enhanced_prompt = f"""{system_prompt}

RESPONSE FLEXIBILITY GUIDELINES:
🔧 Tool Usage Strategy:
- Use specialized tools when you need real-time data (weather, prices, disease diagnosis)
- Don't force tool usage for general agricultural knowledge questions
- Combine tool data with your expertise for comprehensive answers

🧠 Knowledge-Based Responses:
- Answer directly from your agricultural knowledge when appropriate
- Provide practical farming advice using your expertise
- Share traditional and modern farming techniques
- Explain agricultural concepts, crop management, etc.

🎯 Decision Framework:
- Need current weather? → Use weather tools
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
        
        tool_node = ToolNode(self.tools)
        
        # Create graph
        graph = StateGraph(AgentState)
        graph.add_node("agent", agent_node)
        graph.add_node("tools", tool_node)
        graph.set_entry_point("agent")
        
        # Conditional edges
        graph.add_conditional_edges(
            "agent",
            lambda x: "tools" if x["messages"][-1].tool_calls else END,
        )
        graph.add_edge("tools", "agent")
        
        return graph.compile()
    
    async def process_message(
        self,
        message: str,
        user_context: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        language: str = "bn"
    ) -> Dict[str, Any]:
        """
        Process user message with context awareness
        
        Args:
            message: User's message
            user_context: User information and preferences
            session_id: Chat session ID
            language: Preferred language (bn/en)
            
        Returns:
            Response with translated content if needed
        """
        start_time = time.time()
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if not user_context:
            user_context = {}
        
        # Detect message language if auto-translation is needed
        if language == "auto":
            detection = await translation_service.detect_language(message)
            detected_lang = detection.get("language", "bn")
            language = "bn" if detected_lang in ["bn", "hi"] else "en"
        
        # Translate message to English for processing if needed
        processed_message = message
        if language == "bn" and user_context.get("auto_translate", False):
            translation_result = await translation_service.translate_text(
                text=message,
                target_language="en",
                source_language="bn"
            )
            if translation_result.get("success", False):
                processed_message = translation_result.get("translated_text", message)
        
        # Create agent state
        state = {
            "messages": [HumanMessage(content=processed_message)],
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
            
            # Translate response if needed
            if language == "bn" and user_context.get("auto_translate", False):
                translation_result = await translation_service.translate_agricultural_terms(
                    text=response_content,
                    target_language="bn"
                )
                if translation_result.get("success", False):
                    response_content = translation_result.get("translated_text", response_content)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Prepare response
            response = {
                "content": response_content,
                "session_id": session_id,
                "language": language,
                "timestamp": datetime.now().isoformat(),
                "tool_calls": tool_calls,
                "tool_outputs": tool_outputs,
                "processing_time": processing_time,
                "success": True
            }
            
            return response
            
        except Exception as e:
            processing_time = time.time() - start_time
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
    language: str = "bn"
) -> Dict[str, Any]:
    """
    Enhanced agent runner with context awareness
    """
    return await enhanced_agent.process_message(
        message=query,
        user_context=user_context,
        session_id=session_id,
        language=language
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