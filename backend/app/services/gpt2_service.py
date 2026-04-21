import asyncio
from functools import lru_cache

from transformers import pipeline

from app.core.config import settings

@lru_cache(maxsize=1)
def _load_pipeline():
    return pipeline("text-generation", model=settings.GPT2_MODEL_NAME, max_new_tokens=80)

async def get_gpt2_response(prompt: str) -> str:
    loop = asyncio.get_event_loop()
    generator = _load_pipeline()
    # Run blocking inference in thread pool
    result = await loop.run_in_executor(
        None,
        lambda: generator(
            f"Student question: {prompt}\nHelpful college assistant answer:",
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            num_return_sequences=1,
            pad_token_id=50256,
        )
    )
    generated = result[0]["generated_text"]
    marker = "Helpful college assistant answer:"
    if marker in generated:
        return generated.split(marker, 1)[1].strip()
    return generated.strip()
