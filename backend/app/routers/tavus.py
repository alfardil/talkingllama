from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(
    prefix="/api/tavus",
    tags=["tavus"]
)

class ConversationRequest(BaseModel):
    replica_id: str
    persona_id: str
    callback_url: Optional[str] = None
    conversation_name: Optional[str] = None
    conversational_context: Optional[str] = None
    custom_greeting: Optional[str] = None
    properties: Optional[dict] = None

class VideoRequest(BaseModel):
    replica_id: str
    script: str
    video_name: str

@router.post("/conversations")
async def create_conversation(request: ConversationRequest):
    tavus_api_key = os.getenv("TAVUS_API_KEY")
    if not tavus_api_key:
        raise HTTPException(
            status_code=500,
            detail="TAVUS_API_KEY environment variable is not set"
        )

    headers = {
        "x-api-key": tavus_api_key,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            "https://tavusapi.com/v2/conversations",
            headers=headers,
            json=request.dict(exclude_none=True)
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating Tavus conversation: {str(e)}"
        )

@router.post("/video")
async def create_video(request: VideoRequest):
    tavus_api_key = os.getenv("TAVUS_API_KEY")
    if not tavus_api_key:
        raise HTTPException(
            status_code=500,
            detail="TAVUS_API_KEY environment variable is not set"
        )
    headers = {
        "x-api-key": tavus_api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "replica_id": request.replica_id,
        "script": request.script,
        "video_name": request.video_name
    }
    try:
        response = requests.post("https://tavusapi.com/v2/videos", headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating Tavus video: {str(e)}"
        ) 