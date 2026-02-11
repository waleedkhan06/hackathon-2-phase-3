import os
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# For the rule-based parser, we don't need an external API
# This is just a placeholder for compatibility

def get_openrouter_client():
    # Return None since we're using rule-based parsing
    return None

# Simple model list for any fallback needs
AI_MODELS = [
    "rule-based-parser"  # Indicates we're using rule-based parsing instead of an AI model
]

def get_ai_models() -> list[str]:
    return AI_MODELS
