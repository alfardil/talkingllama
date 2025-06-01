# FastAPI Backend

A modern FastAPI backend with Llama API integration.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:
   Create a `.env` file in the root directory with:

```
LLAMA_API_KEY=your_api_key_here
```

## Running the Application

To run the application in development mode:

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Endpoints

- `GET /`: Welcome message
- `GET /health`: Health check endpoint
- `GET /health/ping`: Simple ping endpoint
- `GET /api/llama`: Llama API endpoint
  - Query parameter: `question` (optional, defaults to "What is the moon made of?")
  - Returns: Llama API response with the model's answer
