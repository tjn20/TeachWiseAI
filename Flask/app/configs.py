import os

class Config:
    GROQ_API_KEY = os.getenv('OPENAI_API_KEY')


class DevelopmentConfig(Config):
    # Development-specific settings
    DEBUG = True    