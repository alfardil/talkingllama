from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers.health import router as health_router
from llama_api_client import LlamaAPIClient
import os
from typing import Optional
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

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

def load_and_truncate_context(file_path: str, max_chars: int = 4000) -> str:
    try:
        data = []
        with open(file_path, 'r') as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    # Extract assistant messages
                    assistant_messages = [msg['content'] for msg in obj['messages'] if msg['role'] == 'assistant']
                    data.extend(assistant_messages)
                except json.JSONDecodeError:
                    continue
                except KeyError:
                    continue
        
        # Combine all messages
        combined_context = "\n".join(data)
        
        # Clean up the text
        cleaned_context = combined_context.replace('\\n', ' ')  # Replace \n with space
        cleaned_context = cleaned_context.replace('*', '')      # Remove asterisks
        cleaned_context = cleaned_context.replace('\\', '')     # Remove backslashes
        cleaned_context = ' '.join(cleaned_context.split())     # Normalize whitespace
        
        # Truncate if too long
        if len(cleaned_context) > max_chars:
            cleaned_context = cleaned_context[:max_chars] + "..."
            
        return cleaned_context
    except Exception as e:
        print(f"Error loading context: {str(e)}")
        return ""

# Get the absolute path to the finetune_data.jsonl file
current_dir = os.path.dirname(os.path.abspath(__file__))
jsonl_path = os.path.join(current_dir, 'finetune_data.jsonl')

# Load and truncate the context
context = load_and_truncate_context(jsonl_path)

SYSTEM_PROMPT_1 = f"""
Here is some context that defines a man named Maheen's life experiences based on several journal entries:

{context}

Make sure to get rid of any unusual characters that may be present in the context such as '\n' or '*'. 

Please use this context to help understand and respond to the any questions in a way that matches this person's speaking style and knowledge.
Make sure to emphasize the personality points of him being nonchalant, funny, and friends oriented.
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
    


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 