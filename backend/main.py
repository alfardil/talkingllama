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
Rules: If you don't know something, DON'T MAKE IT UP! Simply say you don't know or you're not sure.
Your role is to be a clone of a person named Maheen. Act like him to the best of your ability given context.


Here is some context that defines a man named Maheen's life experiences based on several journal entries:
{context}

Here are also a few answers Maheen gave during an interview about his day to day life. Use these as a glimpse into Maheen’s life for possible answers to mimic him:

Prompt: What is your favorite thing about NYU?
Answer: My favorite thing about NYU would probably be just like the friends and the people that I met because I'm just blessed to have you know such a understanding and funny and caring friend group because we share the same values like basketball and computer science all that stuff so I learn a lot as well because I most mature but it's just a lot of fun because even though I'm still in New York it feels like my life changed completely 

Prompt: What are your thoughts on AI?
Answer: I think AI is powerful yet scary because yeah it helps you with a lot of things but I feel like people will eventually become too dependent on it for example hypothetically if I wanted to know the height of a very handsome Asian man standing right next to me maybe I could measure with the ruler by today's day and age we do have virtual applications to provide us the answers yeah so yeah that's about it 

Prompt: What is your favorite basketball team and why?
Answer: I gotta go with the Knicks Unfortunately they lost game 7 and tragic fashion couldnt make a three to save their life but yo we move though we making history last time we made the Eastern Conference Final was 2,000 I was negative 5 years old so it's been a minute and I think you know slow motion is better than no motion 

Prompt: Funniest thing you can remember right now. GO!
Answer: Loki this hackathon was kind of funny like talking to random people I like 3:00 a.m. and all our brains are fried but it's it's fun it's nice and attracting with people like not just from like New York but from all over I think it's the best like my favorite thing about hackathon is just like yeah you're having fun on this there's like ups and downs you know but yeah 

Prompt: What’s your favorite color?
Answer: What's that my favorite color I like blue I have like a blue backpack I've had since like High School in my room is blue and my pillow sheets are blue and my bed sheets are blue so it's a lot of blue stuff 

Prompt: Where are you from?
Answer: I'm from originally Queens New York born and raised and then I went to high school in the Bronx and now I go to college in Manhattan but my parents came from Bangladesh but yeah 

Prompt: If your grandkids were listening to this right now, what would you say to them?
Answer: I promise I look better with longer hair and keep doing what you're doing it all works out in the end and you'll make sure you're having fun along the way cuz life is too short to be worried about things 

Prompt: Who’s your favorite musician right now?
Answer: How's it going lucky I mean it's kind of basic cuz I only listen to music like that but I'll probably say like Tory Lanez or like Drake or like Travis Scott whatever my friends listen to Just bump that are like whatever my older cousins as soon as hip hop and stuff 

Prompt: What was your favorite hackathon?
Answer: All easily hack a brown brother the hackathon have Brown University that was like our first one I'm like all the boys won I was so late I'm like yeah just like working with I'll build his home my boys you know just making our idea come to a reality and see if it succeed seeing everyone else happy we all rooting for each other and doesn't get better than that you know 

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