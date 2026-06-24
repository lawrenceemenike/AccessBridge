import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.orchestrator import run_access_bridge

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NavigateRequest(BaseModel):
    prompt: str = Field(..., max_length=500)
    thread_id: Optional[str] = None

@app.post("/api/navigate")
@limiter.limit("5/minute")
async def navigate(request: Request, payload: NavigateRequest):
    thread_id = payload.thread_id or uuid.uuid4().hex
    result_state = run_access_bridge(payload.prompt, thread_id)
    # Ensure the thread_id is returned to the client so they can maintain state
    result_state["thread_id"] = thread_id
    return result_state
