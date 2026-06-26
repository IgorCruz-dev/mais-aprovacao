import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY não configurada")
        _client = genai.Client(api_key=api_key)
    return _client
