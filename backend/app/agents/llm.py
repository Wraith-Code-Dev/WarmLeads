import litellm
import json
import logging
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

async def call_llm_json(prompt: str) -> Dict[str, Any]:
    """
    Centralized LLM execution supporting Azure OpenAI, OpenAI, Gemini, Anthropic via LiteLLM.
    Returns parsed JSON response dictionary.
    """
    # 1. Check Azure OpenAI credentials
    if settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_ENDPOINT:
        model = f"azure/{settings.AZURE_OPENAI_DEPLOYMENT_NAME}"
        api_key = settings.AZURE_OPENAI_API_KEY
        api_base = settings.AZURE_OPENAI_ENDPOINT
        api_version = settings.AZURE_OPENAI_API_VERSION
        
        logger.info(f"Calling Azure OpenAI LiteLLM model: {model}")
        response = await litellm.acompletion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            api_key=api_key,
            api_base=api_base,
            api_version=api_version,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)

    # 2. Check Standard OpenAI / Gemini / Anthropic keys
    elif settings.OPENAI_API_KEY or settings.GEMINI_API_KEY or settings.ANTHROPIC_API_KEY:
        model = settings.LITELLM_MODEL
        logger.info(f"Calling standard LiteLLM model: {model}")
        response = await litellm.acompletion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)

    else:
        raise ValueError("No valid LLM API key configured (Azure OpenAI or standard provider).")
