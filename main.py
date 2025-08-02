from fastapi import FastAPI
from app.api import agent
import uvicorn

app = FastAPI(title="AI Agent Service")

app.include_router(agent.router, prefix="/api/agent")

@app.get("/")
def read_root():
    return {"message": "AI Agent Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
