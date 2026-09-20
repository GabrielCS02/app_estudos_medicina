# backend/app/api/rotas_painel.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.models.schema_db import Avaliacao, Materia, StatusAvaliacaoEnum, TipoAvaliacaoEnum

router = APIRouter(tags=["Painel de Visão Geral e Cronograma"])

# Schemas Pydantic para validação
class AvaliacaoCreate(BaseModel):
    materia_id: int
    tipo_avaliacao: str
    conteudo_cobrado: str
    data: date
    valor: float = 10.0

class AvaliacaoUpdate(BaseModel):
    tipo_avaliacao: Optional[str] = None
    status: Optional[str] = None
    nota_obtida: Optional[float] = None

# --- Rotas do Cronograma ---

@router.get("/cronograma")
def obter_cronograma(db: Session = Depends(get_db)):
    """Busca todas as avaliações cadastradas e calcula os dias restantes dinamicamente."""
    avaliacoes = db.query(Avaliacao).all()
    hoje = date.today()
    resultado = []
    
    for av in avaliacoes:
        dias = (av.data - hoje).days
        resultado.append({
            "id": av.id,
            "disciplina": av.materia.nome if av.materia else "Geral",
            "tipo_avaliacao": av.tipo_avaliacao.value if hasattr(av.tipo_avaliacao, "value") else str(av.tipo_avaliacao),
            "conteudo_cobrado": av.conteudo_cobrado,
            "data": av.data.isoformat(),
            "dias_restantes": dias,  # Retorna o valor real de dias (positivo ou negativo)
            "valor": av.valor,
            "nota_obtida": av.nota_obtida,
            "status": av.status.value if hasattr(av.status, "value") else str(av.status)
        })
    return resultado

@router.post("/avaliacoes/")
def criar_avaliacao(dados: AvaliacaoCreate, db: Session = Depends(get_db)):
    """Cadastra uma nova avaliação atrelada a uma matéria."""
    materia = db.query(Materia).filter(Materia.id == dados.materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Matéria selecionada não existe")

    # Mapeia a string para o Enum correspondente
    tipo_enum = dados.tipo_avaliacao
    for enum_item in TipoAvaliacaoEnum:
        if enum_item.value == dados.tipo_avaliacao or enum_item.name == dados.tipo_avaliacao:
            tipo_enum = enum_item
            break

    nova_avaliacao = Avaliacao(
        materia_id=dados.materia_id,
        tipo_avaliacao=tipo_enum,
        conteudo_cobrado=dados.conteudo_cobrado,
        data=dados.data,
        valor=dados.valor,
        status=StatusAvaliacaoEnum.PENDENTE
    )
    db.add(nova_avaliacao)
    db.commit()
    db.refresh(nova_avaliacao)
    return {"status": "sucesso", "avaliacao_id": nova_avaliacao.id}

@router.patch("/avaliacoes/{avaliacao_id}")
def atualizar_avaliacao_inline(avaliacao_id: int, dados: AvaliacaoUpdate, db: Session = Depends(get_db)):
    """Atualiza tipo, nota obtida ou status de uma avaliação diretamente da tabela."""
    av = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    if not av:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")

    if dados.tipo_avaliacao is not None:
        for item in TipoAvaliacaoEnum:
            if item.value == dados.tipo_avaliacao or item.name == dados.tipo_avaliacao:
                av.tipo_avaliacao = item
                break

    if dados.status is not None:
        for item in StatusAvaliacaoEnum:
            if item.value == dados.status or item.name == dados.status:
                av.status = item
                break

    if dados.nota_obtida is not None:
        av.nota_obtida = dados.nota_obtida

    db.commit()
    return {"status": "sucesso"}

# --- Dashboard Visão Geral ---

@router.get("/dashboard/visao-geral")
def obter_dashboard_visao_geral(db: Session = Depends(get_db)):
    hoje = date.today()
    
    # Próximas avaliações em menos de 7 dias
    data_limite = hoje + timedelta(days=7)
    provas_proximas = db.query(Avaliacao).filter(
        Avaliacao.data >= hoje,
        Avaliacao.data <= data_limite,
        Avaliacao.status != StatusAvaliacaoEnum.CONCLUIDO
    ).all()
    
    alertas = [
        f"{p.materia.nome if p.materia else 'Geral'} - {p.tipo_avaliacao.value if hasattr(p.tipo_avaliacao, 'value') else p.tipo_avaliacao} (Daqui a {(p.data - hoje).days} dias)"
        for p in provas_proximas
    ]

    return {
        "desempenho_consolidado": [{"disciplina": "Anatomia", "aproveitamento": 85.0}],
        "agenda_dinamica": {
            "titulo": "O QUE REVISAR HOJE?",
            "tarefas": []
        },
        "alertas": {
            "titulo": "PRÓXIMAS AVALIAÇÕES E PROVAS",
            "provas_proximas": alertas
        },
        "aproveitamento_medio_geral": 80.0
    }