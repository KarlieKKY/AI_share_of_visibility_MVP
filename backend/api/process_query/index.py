import os
from dotenv import load_dotenv
import requests


load_dotenv()

PERPLEXITY_API_KEY = os.getenv("Perplexity_API_Key")

def process_query(query: str) -> dict:
    chat_url = "https://api.perplexity.ai/chat/completions"
    payload = {
    "model": "sonar-pro",
    "messages": [
        {
            "role": "system",
            "content": "Be precise and concise."
        },
        {
            "role": "user",
            "content": query
            }
        ]
    }
    headers = {
        "Authorization": "Bearer " + PERPLEXITY_API_KEY,
        "Content-Type": "application/json"
    }

    chat_response = requests.post(chat_url, json=payload, headers=headers)
    return chat_response.json()['choices'][0]['message']['content']

