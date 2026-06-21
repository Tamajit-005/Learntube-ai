from openai import AsyncOpenAI
from app.config import get_active_config

cfg = get_active_config()
client = AsyncOpenAI(api_key=cfg["api_key"], base_url=cfg["base_url"])

async def generate_ai_response(prompt: str, response_format: dict | None = None):

    kwargs = dict(
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

    if response_format is not None:
        kwargs["response_format"] = response_format

    response = await client.chat.completions.create(**kwargs)

    return response.choices[0].message.content
