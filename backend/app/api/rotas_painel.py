from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func # Importação essencial para cálculos SQL avançados
from datetime import date, timedelta

from app.core.database import get_db
from app.models.schema_db import (
    Avaliacao, 
    Revisao, 
    Materia,
    Topico,
    Subtopico,
    StatusRevisaoEnum, 
    StatusAvaliacaoEnum
)

router = APIRouter(tags=["Painel de Visão Geral"])

@router.get("/cronograma")
def obter_cronograma(db: Session = Depends(get_db)):
    """
    Retorna a lista formatada para a aba CRONOGRAMA DE AVALIAÇÕES E PROVAS.
    Calcula dinamicamente os 'Dias Restantes' baseando-se na data atual.
    """
    hoje = date.today()
    avaliacoes = db.query(Avaliacao).all()
    
    resultado = []
    for aval in avaliacoes:
        nome_disciplina = aval.materia.nome if aval.materia else "Desconhecida"
        dias_restantes = (aval.data - hoje).days
        
        resultado.append({
            "disciplina": nome_disciplina,
            "tipo_avaliacao": aval.tipo_avaliacao.value, 
            "conteudo_cobrado": aval.conteudo_cobrado,
            "data": aval.data.isoformat(),
            "dias_restantes": dias_restantes,
            "valor": aval.valor,
            "nota_obtida": aval.nota_obtida,
            "status": aval.status.value
        })
        
    return resultado

@router.get("/dashboard/visao-geral")
def obter_dashboard_visao_geral(db: Session = Depends(get_db)):
    """
    Agrega os dados 100% dinâmicos para a página principal.
    """
    hoje = date.today()
    limite_alerta = hoje + timedelta(days=7)
    
    # 1. AGENDA DINÂMICA • O QUE REVISAR HOJE?
    revisoes_pendentes = db.query(Revisao).filter(
        Revisao.data_agendada <= hoje,
        Revisao.status == StatusRevisaoEnum.PENDENTE
    ).all()
    tarefas_formatadas = [f"Aula ID {rev.aula_id} - Revisão {rev.numero_revisao}" for rev in revisoes_pendentes]
    
    # 2. ALERTA • PRÓXIMAS AVALIAÇÕES E PROVAS
    proximas_avaliacoes = db.query(Avaliacao).filter(
        Avaliacao.data >= hoje,
        Avaliacao.data <= limite_alerta,
        Avaliacao.status != StatusAvaliacaoEnum.CONCLUIDO
    ).all()
    alertas_formatados = [
        f"{aval.materia.nome if aval.materia else 'Prova'} - {aval.tipo_avaliacao.value} (Daqui a {(aval.data - hoje).days} dias)"
        for aval in proximas_avaliacoes
    ]

    # 3. INTELIGÊNCIA SQL: Aproveitamento Médio Geral
    # Calcula a média da coluna questoes_percentual em todos os subtópicos da base[cite: 1]
    media_geral_db = db.query(func.avg(Subtopico.questoes_percentual)).scalar()
    aproveitamento_geral = round(media_geral_db, 2) if media_geral_db else 0.0

    # 4. INTELIGÊNCIA SQL: Desempenho Consolidado por Disciplina
    # Junta as tabelas (Materia -> Topico -> Subtopico) e agrupa a média por Matéria[cite: 1]
    desempenho_db = db.query(
        Materia.nome.label("disciplina"),
        func.avg(Subtopico.questoes_percentual).label("aproveitamento")
    ).join(Topico, Materia.id == Topico.materia_id)\
     .join(Subtopico, Topico.id == Subtopico.topico_id)\
     .group_by(Materia.nome).all()

    desempenho_formatado = [
        {"disciplina": row.disciplina, "aproveitamento": round(row.aproveitamento, 2) if row.aproveitamento else 0.0}
        for row in desempenho_db
    ]

    return {
        "desempenho_consolidado": desempenho_formatado if desempenho_formatado else [{"disciplina": "Sem dados", "aproveitamento": 0.0}],
        "agenda_dinamica": {
            "titulo": "O QUE REVISAR HOJE?",
            "tarefas": tarefas_formatadas if tarefas_formatadas else ["Nenhuma revisão pendente para hoje!"]
        },
        "alertas": {
            "titulo": "PRÓXIMAS AVALIAÇÕES E PROVAS",
            "provas_proximas": alertas_formatados if alertas_formatados else ["Nenhuma prova nos próximos 7 dias."]
        },
        "aproveitamento_medio_geral": aproveitamento_geral
    }