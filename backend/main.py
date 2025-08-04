from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import agent
import uvicorn

app = FastAPI(title="AI Agent Service")

# Add CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent.router, prefix="/api/agent")

@app.get("/")
def read_root():
    return {"message": "AI Agent Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
