from fastapi import APIRouter
from pydantic import BaseModel
from app.services.agent import create_agent, run_agent

router = APIRouter()

class AgentQuery(BaseModel):
    query: str

@router.post("/invoke")
def invoke_agent(query: AgentQuery):
    agent = create_agent()
    result = run_agent(agent, query.query)
    return {"result": result}
