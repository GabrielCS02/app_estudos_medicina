# backend/app/api/rotas_painel.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

# router exclusivo para visualizações
router = APIRouter(tags=["Painel de Visão Geral"])

@router.get("/cronograma")
def obter_cronograma():
    hoje = date.today()
    return [
        {
            "disciplina": "Anatomia",
            "tipo_avaliacao": "Prova Prática", 
            "conteudo_cobrado": "Membro Superior",
            "data": "2026-10-15",
            "dias_restantes": (date(2026, 10, 15) - hoje).days,
            "valor": 10.0,
            "nota_obtida": None,
            "status": "Pendente"
        }
    ]

@router.get("/dashboard/visao-geral")
def obter_dashboard_visao_geral():
    return {
        "desempenho_consolidado": [
            {"disciplina": "Anatomia", "aproveitamento": 85.0}
        ],
        "agenda_dinamica": {
            "titulo": "O QUE REVISAR HOJE?",
            "tarefas": ["Subtópico X - Revisão 1", "Subtópico Y - Revisão 2"]
        },
        "alertas": {
            "titulo": "PRÓXIMAS AVALIAÇÕES E PROVAS",
            "provas_proximas": ["Fisiologia - P1 (Daqui a 3 dias)"]
        },
        "aproveitamento_medio_geral": 78.75
    }