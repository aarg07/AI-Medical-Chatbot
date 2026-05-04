import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from chatbot import MedicalEmergencyChatbot

app = FastAPI(title="MedBot API", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bot = MedicalEmergencyChatbot(db_path=os.path.join(os.path.dirname(__file__), '..', 'data', 'vector_db'))

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    # Match what the frontend sends: {"messages": [...]}
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    urgency: str
    is_emergency: bool

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
        
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    # The last message is the current user query
    last_user_message = next((m for m in reversed(messages) if m['role'] == 'user'), None)
    if not last_user_message:
        raise HTTPException(status_code=400, detail="No user message found")
        
    user_query = last_user_message['content']
    history = messages[:-1] # All messages except the last one

    result = bot.chat(user_query, history)
    
    return ChatResponse(
        response=result["response"],
        urgency=result["urgency"],
        is_emergency=(result["urgency"] == "CRITICAL")
    )

@app.get("/health")
async def health():
    return {"status": "ok", "model": "MedBot v1.0"}

if __name__ == "__main__":
    import uvicorn
    # Run on port 5000 to match existing frontend configuration
    uvicorn.run(app, host="0.0.0.0", port=5000)
