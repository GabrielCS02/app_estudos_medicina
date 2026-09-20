from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Cria um arquivo de banco de dados local chamado "banco_estudos.db" na raiz do backend
SQLALCHEMY_DATABASE_URL = "sqlite:///./banco_estudos.db"

# connect_args={"check_same_thread": False} é exigido pelo FastAPI ao usar SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Função de injeção de dependência que as rotas tentaram importar
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()