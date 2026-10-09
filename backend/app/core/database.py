import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Lê a URL configurada no Render ou utiliza o SQLite localmente
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./banco_estudos.db")

# Ajuste de compatibilidade para o SQLAlchemy
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Se a URL começar com postgresql://, garante o uso explícito do psycopg2 ou psycopg
if SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and not SQLALCHEMY_DATABASE_URL.startswith("postgresql+"):
    # Permite que o SQLAlchemy use o driver psycopg instalado
    pass

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()