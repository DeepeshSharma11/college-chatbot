"""
GPT-2 fallback removed from production pipeline.
Groq (llama-3.3-70b) handles all LLM calls.
GPT-2 was causing 30s+ timeouts on Render (no GPU).
"""

async def get_gpt2_response(prompt: str) -> str:
    """Disabled: GPT-2 replaced by Groq in production."""
    return ""
