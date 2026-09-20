from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importando os arquivos de rotas que criamos
from app.api import rotas_estudos, rotas_painel

app = FastAPI(title="API - Acompanhamento de Estudos Medicina")

# Configuração do Middleware CORS para permitir que o Frontend (Chat 3) se comunique com esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, substitua pelo domínio do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrando os routers para que o FastAPI reconheça os endpoints
app.include_router(rotas_estudos.router)
app.include_router(rotas_painel.router)

# Rota raiz de teste rápido
@app.get("/")
def read_root():
    return {"status": "API de Acompanhamento de Estudos rodando perfeitamente!"}