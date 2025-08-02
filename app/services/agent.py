from typing import Annotated, TypedDict

import httpx
from langchain_core.messages import BaseMessage
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from app.core.config import GOOGLE_API_KEY


@tool
def get_item_price(item_name: str) -> str:
    """Gets the price of a given item from Chaldal."""
    url = "https://catalog.chaldal.com/searchPersonalized"
    
    headers = {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9,fr;q=0.8,zh-CN;q=0.7,zh;q=0.6",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": "sbcV2=%7B%22MetropolitanAreaId%22%3A1%2C%22PvIdToQtyStoreIdLastSeqRecType%22%3A%7B%7D%7D",
        "Referer": "https://chaldal.com/",
    }
    
    body = {
        "apiKey": "e964fc2d51064efa97e94db7c64bf3d044279d4ed0ad4bdd9dce89fecc9156f0",
        "storeId": 1,
        "warehouseId": 8,
        "pageSize": 100,
        "currentPageIndex": 0,
        "metropolitanAreaId": 1,
        "query": item_name,
        "productVariantId": -1,
        "bundleId": {"case":"None"},
        "canSeeOutOfStock": "true",
        "filters": [],
        "maxOutOfStockCount": {"case":"Some","fields":[5]},
        "shouldShowAlternateProductsForAllOutOfStock": {"case":"Some","fields":["true"]},
        "customerGuid": {"case":"None"},
        "deliveryAreaId": {"case":"None"},
        "shouldShowCategoryBasedRecommendations": {"case":"None"}
    }

    with httpx.Client() as client:
        try:
            response = client.post(url, headers=headers, json=body)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as exc:
            return f"HTTP error occurred: {exc}"
        except httpx.RequestError as exc:
            return f"Request error occurred: {exc}"

    hits = data.get("hits", [])
    if not hits:
        return f"Sorry, I couldn't find the price for {item_name}."

    return f"Found prices for {item_name}: " + ", ".join(
        [f"{item.get('name')}: {item.get('price')}" for item in hits]
    )


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], lambda x, y: x + y]


def create_agent():
    """Creates and returns a Gemini agent with the item price tool."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GOOGLE_API_KEY,
        convert_system_message_to_human=True,
    )
    tools = [get_item_price]
    llm_with_tools = llm.bind_tools(tools)

    def agent_node(state):
        return {"messages": [llm_with_tools.invoke(state["messages"])]}

    tool_node = ToolNode(tools)

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges(
        "agent",
        lambda x: "tools" if x["messages"][-1].tool_calls else END,
    )
    graph.add_edge("tools", "agent")

    return graph.compile()


def run_agent(agent, query: str):
    """Runs the agent and returns the result."""
    return agent.invoke({"messages": [("human", query)]})
