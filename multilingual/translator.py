import os
import logging
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("multilingual.translator")

# Language mapping
LANG_MAP = {
    "hindi": {"code": "hi", "name": "Hindi"},
    "kannada": {"code": "kn", "name": "Kannada"},
    "bengali": {"code": "bn", "name": "Bengali"},
    "tamil": {"code": "ta", "name": "Tamil"},
    "marathi": {"code": "mr", "name": "Marathi"}
}

def translate_ai(text: str, target_langs: list, api_key: str) -> dict:
    """
    Translates text preserving context/humor using direct OpenAI HTTP REST API request.
    Raises exception if API call fails.
    """
    # Resolve target language names
    resolved_langs = []
    for lang in target_langs:
        lang_lower = lang.lower().strip()
        if lang_lower in LANG_MAP:
            resolved_langs.append(LANG_MAP[lang_lower]["name"])
            
    if not resolved_langs:
        return {}
        
    langs_str = ", ".join(resolved_langs)
    
    system_prompt = (
        "You are an expert translator and cultural adaptation specialist (transcreator).\n"
        "Your task is to translate the given English text into the following Indian languages:\n"
        f"{langs_str}\n\n"
        "CRITICAL INSTRUCTIONS:\n"
        "1. Do not perform simple literal or word-for-word translation if the text contains humor, sarcasm, jokes, idioms, wordplay, or cultural references.\n"
        "2. Instead, transcreate the text so that it has the SAME emotional impact, humor, and natural flow in each target language.\n"
        "3. Preserve the original context and meaning.\n"
        "4. Return the output as a valid JSON object only. The JSON keys must be the language names (e.g. 'Hindi', 'Kannada', etc.) and the value must be a string containing the translated text.\n"
        "Example JSON output format:\n"
        "{\n"
        '  "Hindi": "translated text",\n'
        '  "Kannada": "translated text"\n'
        "}"
    )
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.7
    }
    
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30
    )
    response.raise_for_status()
    
    # Parse the JSON response
    data = response.json()
    raw_content = data["choices"][0]["message"]["content"]
    
    import json
    translated_data = json.loads(raw_content)
    
    results = {}
    for name in resolved_langs:
        val = translated_data.get(name) or translated_data.get(name.lower()) or translated_data.get(name.upper())
        if val:
            results[name] = {
                "translation": val,
                "warning": None
            }
        else:
            results[name] = {
                "error": "Model response was missing this language translation"
            }
            
    return results

def translate_text(text: str, target_langs: list) -> dict:
    """
    Main entry point for translation. Attempts OpenAI translation, returning error if it fails or key is missing.
    """
    api_key = os.getenv("OPEN_AI_API_KEY")
    
    if not api_key:
        logger.error("OPEN_AI_API_KEY is not set.")
        return {
            "mode": "AI Transcreation (OpenAI)",
            "error": "OPEN_AI_API_KEY is not configured in the environment variables."
        }
        
    try:
        logger.info("Attempting AI Translation with OpenAI API...")
        translations = translate_ai(text, target_langs, api_key)
        return {
            "mode": "AI Transcreation (OpenAI)",
            "translations": translations
        }
    except Exception as e:
        logger.error(f"OpenAI translation failed: {str(e)}")
        return {
            "mode": "AI Transcreation (OpenAI)",
            "error": f"OpenAI translation failed: {str(e)}"
        }
