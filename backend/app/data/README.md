# Invertis RAG Knowledge

Add or update chatbot facts in `invertis_knowledge.json`.

Each document should follow this shape:

```json
{
    "id": "unique_short_id",
    "title": "Answer Heading",
    "keywords": ["words", "students", "may", "ask"],
    "source_url": "https://official-source-url",
    "text": "The answer content the bot should use."
}
```

After editing the JSON file, restart the backend server so the cached knowledge reloads.
