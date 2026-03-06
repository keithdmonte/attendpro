import os
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Go from .../backend/app/core/config.py -> project root .../attendpro
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Load .env from project root explicitly
load_dotenv(dotenv_path=os.path.join(PROJECT_ROOT, ".env"))

def _normalize_db_url(url: str) -> str:
    """Render uses postgres://; SQLAlchemy prefers postgresql://."""
    if url and url.startswith("postgres://"):
        return "postgresql://" + url[11:]
    return url


class Settings(BaseSettings):
    database_url: str = Field(..., alias="DATABASE_URL")

    @property
    def normalized_database_url(self) -> str:
        return _normalize_db_url(self.database_url)

    model_config = SettingsConfigDict(
        env_file=os.path.join(PROJECT_ROOT, ".env"),
        env_file_encoding="utf-8",
        populate_by_name=True,
    )

settings = Settings()
