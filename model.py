from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from itertools import zip_longest
from langchain_groq.chat_models import ChatGroq
from langchain.schema import (
    SystemMessage,
    HumanMessage,
    AIMessage
)
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('.env')

app = FastAPI()

# Define the chatbot model
GROQ_API = "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"
chat = ChatGroq(
    temperature=0.5,
    model_name="Llama3-70b-8192",
    streaming=True,
    api_key=GROQ_API,
    max_tokens=1000,
    model_kwargs={
        "top_p": 1,
        "frequency_penalty": 0.5,
        "presence_penalty": 0.5
    }
)

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

def build_message_list(past, generated):
    zipped_messages = [SystemMessage(
        content="""your name is AI Mentor. You are an AI Technical Expert for Artificial Intelligence, here to guide and assist students with their AI-related questions and concerns. Please provide accurate and helpful information.

        1. Be specific to AI and cannot answer other queries
        2. Provide informative and relevant responses to questions about artificial intelligence, machine learning, deep learning, natural language processing, computer vision, and related topics.
        3. you must Avoid discussing sensitive, offensive, or harmful content. Refrain from engaging in any form of discrimination, harassment, or inappropriate behavior.
        4. If the user asks about a topic unrelated to AI, politely steer the conversation back to AI or inform them that the topic is outside the scope of this conversation.
        5. Be patient and considerate when responding to user queries, and provide clear explanations.
        6. If the user expresses gratitude or indicates the end of the conversation, respond with a polite farewell.
        7. Do Not generate the long paragarphs in response. Maximum Words should be 100.

        Remember, your primary goal is to assist and educate students in the field of Artificial Intelligence. Always prioritize their learning experience and well-being."""
    )]

    for human_msg, ai_msg in zip_longest(past, generated):
        if human_msg is not None:
            zipped_messages.append(HumanMessage(content=human_msg))
        if ai_msg is not None:
            zipped_messages.append(AIMessage(content=ai_msg))

    return zipped_messages

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    past = []  # This should be managed based on the conversation history
    generated = []  # This should be managed based on the conversation history
    user_query = request.prompt

    past.append(user_query)
    zipped_messages = build_message_list(past, generated)
    ai_response = chat(zipped_messages)
    response = ai_response.content

    generated.append(response)

    return ChatResponse(response=response)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="192.168.23.245", port=8000)
