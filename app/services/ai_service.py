from openai import AsyncOpenAI
from app.config import get_active_config

cfg = get_active_config()
client = AsyncOpenAI(api_key=cfg["api_key"], base_url=cfg["base_url"])

async def generate_ai_response(prompt: str):

    response = await client.chat.completions.create(
        model=cfg["model"],
        messages=[
            {
                "role": "system",
                "content": "You are an educational AI assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    return response.choices[0].message.content
