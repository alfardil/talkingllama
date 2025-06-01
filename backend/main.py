from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers.health import router as health_router
from llama_api_client import LlamaAPIClient
import os
from typing import Optional
from dotenv import load_dotenv
import json
import re
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Define the VoiceInput model
class VoiceInput(BaseModel):
    text: str

app = FastAPI(
    title="Llama Backend",
    description="A FastAPI backend for Llama API integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)

def load_and_truncate_context(file_path: str) -> str:
    try:
        data = []
        with open(file_path, 'r') as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    # Extract messages with their roles for better context
                    messages = []
                    for msg in obj['messages']:
                        role = msg.get('role', '')
                        content = msg.get('content', '')
                        if role and content:
                            messages.append(f"{role}: {content}")
                    data.extend(messages)
                except json.JSONDecodeError:
                    continue
                except KeyError:
                    continue
        
        # Combine all messages with proper spacing
        combined_context = "\n\n".join(data)
        
        # Clean up the text while preserving important formatting
        cleaned_context = combined_context.replace('\\n', '\n')  # Preserve actual newlines
        cleaned_context = cleaned_context.replace('\\', '')      # Remove escape characters
        cleaned_context = re.sub(r'\s+', ' ', cleaned_context)  # Normalize whitespace
        cleaned_context = cleaned_context.strip()                # Remove leading/trailing whitespace
            
        return cleaned_context
    except Exception as e:
        print(f"Error loading context: {str(e)}")
        return ""

# Get the absolute path to the finetune_data.jsonl file
current_dir = os.path.dirname(os.path.abspath(__file__))
jsonl_path = os.path.join(current_dir, 'finetune_data.jsonl')

# Load the context
context = load_and_truncate_context(jsonl_path)

SYSTEM_PROMPT_1 = f"""
You are a friendly, casual AI assistant. Your responses should be:
- Natural and conversational, without forcing slang or casual language
- Focused on the user's actual query
- Engaging and personal, but not overly specific about events or people
- Respectful of cultural and religious references when appropriate
- Helpful and informative while maintaining a friendly tone

Here is the context from the journal entries to understand the speaking style:

{context}

Use this context to understand the natural speaking style, but don't reference specific events or people unless directly mentioned by the user. The goal is to maintain a friendly, conversational tone while keeping responses relevant to the actual query.

For example, if someone asks about your day, you should respond in a natural, diary-like style similar to the context, but without referencing specific people or events from the context unless they were mentioned in the current conversation.
"""

@app.get("/")
async def root():
    return {
        "description": "Llama Backend",
        "authors": "Al, Maheen, Abid, Talha"
    }

# trained the api i guess? lol
@app.get("/api/llama/context")
async def llama(question: str = "Why do you journal?"):
    api_key = os.environ.get("LLAMA_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="LLAMA_API_KEY environment variable is not set"
        )

    try:
        client = LlamaAPIClient(api_key=api_key)
        completion = client.chat.completions.create(
            model="Llama-4-Maverick-17B-128E-Instruct-FP8",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT_1
                },
                {
                    "role": "user",
                    "content": question,
                }
            ],
        )
        return {
            "response": completion.completion_message.content.text,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calling Llama API: {str(e)}"
        )
    
@app.post("/api/llama/voice")
async def handle_voice_input(voice_input: VoiceInput):
    api_key = os.environ.get("LLAMA_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="LLAMA_API_KEY environment variable is not set"
        )

    try:
        client = LlamaAPIClient(api_key=api_key)
        
        # Create a prompt that emphasizes natural conversation
        system_prompt = f"""
        {SYSTEM_PROMPT_1}
        
        The user has just spoken this text through voice input. Respond in a natural, conversational way
        that matches the personality described in the context. Keep responses concise and engaging.
        """
        
        completion = client.chat.completions.create(
            model="Llama-4-Maverick-17B-128E-Instruct-FP8",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": voice_input.text,
                }
            ],
        )
        
        return {
            "response": completion.completion_message.content.text,
            "original_input": voice_input.text
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing voice input: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 