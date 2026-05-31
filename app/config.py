from dotenv import load_dotenv
import os

load_dotenv()

# --- AI Provider Config ---
# Options: "openai", "gemini", "custom"
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Gemini (uses OpenAI-compatible endpoint)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Custom OpenAI-compatible endpoint (e.g. Ollama, LocalAI, vLLM)
CUSTOM_API_KEY = os.getenv("CUSTOM_API_KEY", "")
CUSTOM_BASE_URL = os.getenv("CUSTOM_BASE_URL", "")

# Resolve the active credentials
def get_active_config():
    if AI_PROVIDER == "gemini":
        return {
            "api_key": GEMINI_API_KEY,
            "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
            "model": os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
        }
    elif AI_PROVIDER == "custom":
        return {
            "api_key": CUSTOM_API_KEY,
            "base_url": CUSTOM_BASE_URL,
            "model": os.getenv("CUSTOM_MODEL", "gpt-4.1-mini"),
        }
    else:  # openai
        return {
            "api_key": OPENAI_API_KEY,
            "base_url": os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        }

MAX_CHUNK_SIZE = 800
OVERLAP_SIZE = 200
