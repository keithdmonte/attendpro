# backend/alembic/env.py

from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# ---------------------------------------------------------------------------
# PATHS & ENV
# ---------------------------------------------------------------------------
# Project root: .../attendpro
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
# Backend dir: .../attendpro/backend
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

# Ensure backend dir is importable so we can do 'from db...' and 'from models...'
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Load .env from project root so DATABASE_URL is available
from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# ---------------------------------------------------------------------------
# APP METADATA (import Base + models so metadata is populated)
# ---------------------------------------------------------------------------
from db.session import Base  # SQLAlchemy Base from backend/db/session.py

# Import models to register them with Base.metadata
from models.student import Student  # noqa: F401
from models.teacher import Teacher  # noqa: F401
from models.subject import Subject  # noqa: F401
from models.attendance import Attendance  # noqa: F401
from models.message import Message  # noqa: F401
from models.semester_archive import SemesterArchive  # noqa: F401
from models.admin import Admin  # noqa: F401


# Alembic will scan this metadata when autogenerating migrations
target_metadata = Base.metadata

# ---------------------------------------------------------------------------
# ALEMBIC CONFIG
# ---------------------------------------------------------------------------
config = context.config

# Allow overriding sqlalchemy.url via env
db_url = os.getenv("DATABASE_URL")
if db_url:
    # Render uses postgres://; SQLAlchemy prefers postgresql://
    if db_url.startswith("postgres://"):
        db_url = "postgresql://" + db_url[11:]
    safe_url = db_url.replace("%", "%%")  # escape % for configparser
    config.set_main_option("sqlalchemy.url", safe_url)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
