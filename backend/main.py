from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import List, Optional, Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175",
    "http://127.0.0.1:5175",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class ChatRequest(BaseModel):
    message: str
    tasks: Optional[List[Dict[str, Any]]] = []
    history: Optional[List[Dict[str, Any]]] = []

def format_history(history):
    lines = []
    for msg in history:
        role = msg.get("sender")
        text = msg.get("text")
        if role == "user":
            lines.append(f"User: {text}")
        else:
            lines.append(f"Assistant: {text}")
    return "\n".join(lines)

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/chat")
def chat(req: ChatRequest):
    print("TASKS RECEIVED:", req.tasks)
    task_context = "\n".join([
        f"- {task.get('title')} | due: {task.get('date')} | priority: {task.get('priority')} | completed: {task.get('completed')}"
        for task in req.tasks
    ])
    history_text = format_history(req.history)

    prompt = f"""
You are AcadMate, a helpful academic productivity assistant.


CONVERSATION HISTORY:
{history_text if history_text else "None"}

USER TASKS:
{task_context if task_context else "No tasks available."}

RULES:
- If the user asks about tasks, deadlines, priorities, or planning → use the task list
- If tasks exist, mention relevant ones
- If the user asks general questions → answer normally
- If the user greets (hi, hello, hey) → respond warmly
- NEVER return an empty response
- Use history to maintain context
- Stay consistent with previous messages
- Max 2 sentences, max 25 words


USER MESSAGE:
{req.message}

Give a helpful, natural response.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()
    return {"response": data["response"]}


    