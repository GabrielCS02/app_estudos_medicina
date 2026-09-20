from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.core.database import get_db
from app.models.schema_db import (
    Materia, 
    Topico, 
    Subtopico, 
    Aula, 
    Revisao, 
    StatusRevisaoEnum, 
    DificuldadeCorEnum
)
from app.services.motor_calculos import (
    agendar_revisoes,
    classificar_dificuldade_cor
)

router = APIRouter(tags=["Estudos e Estrutura"])

# ==========================================
# ROTAS DE HIERARQUIA (Matérias, Tópicos e Subtópicos)
# ==========================================

@router.post("/materias/")
def criar_materia(nome: str, db: Session = Depends(get_db)):
    """Cria uma nova matéria com proteção contra duplicatas e variações de maiúsculas/minúsculas."""
    nome_limpo = nome.strip()
    
    materia_existente = db.query(Materia).filter(
        func.lower(Materia.nome) == nome_limpo.lower()
    ).first()
    
    if materia_existente:
        return {"status": "existente", "materia_id": materia_existente.id, "nome": materia_existente.nome}
        
    nova_materia = Materia(nome=nome_limpo)
    db.add(nova_materia)
    db.commit()
    db.refresh(nova_materia)
    return {"status": "sucesso", "materia_id": nova_materia.id, "nome": nova_materia.nome}


@router.get("/materias/")
def listar_materias(db: Session = Depends(get_db)):
    """Retorna a lista de todas as matérias cadastradas."""
    materias = db.query(Materia).all()
    return [{"id": m.id, "nome": m.nome} for m in materias]


@router.get("/materias/{materia_id}/detalhes")
def obter_detalhes_materia(materia_id: int, db: Session = Depends(get_db)):
    """Busca a estrutura completa da matéria: tópicos, subtópicos, aula e revisões vinculadas."""
    materia = db.query(Materia).filter(Materia.id == materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Matéria não encontrada")
        
    resultado = {
        "id": materia.id,
        "nome": materia.nome,
        "topicos": []
    }
    
    for t in materia.topicos:
        topico_dict = {
            "id": t.id,
            "nome": t.nome,
            "estudo_base": t.estudo_base,
            "subtopicos": []
        }
        for s in t.subtopicos:
            ultima_aula = db.query(Aula).filter(Aula.subtopico_id == s.id).order_by(Aula.data_aula.desc()).first()
            aula_data = None
            
            if ultima_aula:
                revisoes = [
                    {
                        "id": r.id, 
                        "numero": r.numero_revisao, 
                        "data": r.data_agendada, 
                        "status": r.status.value
                    } for r in ultima_aula.revisoes
                ]
                aula_data = {
                    "data_aula": ultima_aula.data_aula,
                    "revisoes": revisoes
                }

            topico_dict["subtopicos"].append({
                "id": s.id,
                "nome": s.nome,
                "estudo_base": s.estudo_base,
                "dificuldade_grau": s.dificuldade_grau,
                "dificuldade_cor": s.dificuldade_cor.value,
                "aproveitamento": s.questoes_percentual,
                "acertos": s.questoes_acertos, 
                "aula": aula_data
            })
        resultado["topicos"].append(topico_dict)
        
    return resultado


@router.post("/materias/{materia_id}/topicos/")
def criar_topico(materia_id: int, nome: str, estudo_base: bool = False, db: Session = Depends(get_db)):
    """Cadastra um novo tópico vinculado a uma matéria."""
    novo_topico = Topico(materia_id=materia_id, nome=nome, estudo_base=estudo_base)
    db.add(novo_topico)
    db.commit()
    db.refresh(novo_topico)
    return {"status": "sucesso", "topico_id": novo_topico.id, "nome": novo_topico.nome}


@router.post("/topicos/{topico_id}/subtopicos/")
def criar_subtopico(topico_id: int, nome: str, dificuldade: int, db: Session = Depends(get_db)):
    """Cadastra um subtópico, validando o grau (0 a 10) e atribuindo a cor correspondente."""
    if not (0 <= dificuldade <= 10):
        raise HTTPException(status_code=400, detail="A dificuldade deve estar entre 0 e 10.")
    
    cor_str = classificar_dificuldade_cor(dificuldade)
    cor_enum = DificuldadeCorEnum(cor_str)
    
    novo_subtopico = Subtopico(
        topico_id=topico_id, 
        nome=nome, 
        dificuldade_grau=dificuldade, 
        dificuldade_cor=cor_enum,
        estudo_base=False
    )
    db.add(novo_subtopico)
    db.commit()
    db.refresh(novo_subtopico)
    
    return {
        "status": "sucesso",
        "subtopico_id": novo_subtopico.id,
        "nome": novo_subtopico.nome,
        "classificacao_cor": cor_str
    }

# ==========================================
# ROTA DE CONTROLE DO ESTUDO BASE E REVISÕES
# ==========================================

@router.patch("/subtopicos/{subtopico_id}/toggle-estudo-base")
def toggle_estudo_base(subtopico_id: int, db: Session = Depends(get_db)):
    """
    Alterna o status do Estudo Base:
    - Ao marcar SIM: cria aula na data de hoje e gera as revisões de 1, 7 e 30 dias.
    - Ao desmarcar para NÃO: remove a aula e exclui todas as revisões vinculadas em cascata.
    """
    subtopico = db.query(Subtopico).filter(Subtopico.id == subtopico_id).first()
    if not subtopico:
        raise HTTPException(status_code=404, detail="Subtópico não encontrado")
    
    subtopico.estudo_base = not subtopico.estudo_base
    
    if subtopico.estudo_base:
        hoje = date.today()
        ultima_aula = db.query(Aula).filter(Aula.subtopico_id == subtopico_id).first()
        
        if not ultima_aula:
            ultima_aula = Aula(subtopico_id=subtopico_id, data_aula=hoje)
            db.add(ultima_aula)
            db.flush()
            
            revisoes = agendar_revisoes(hoje)
            rev1 = Revisao(aula_id=ultima_aula.id, numero_revisao=1, data_agendada=revisoes["rev_1"], status=StatusRevisaoEnum.PENDENTE)
            rev2 = Revisao(aula_id=ultima_aula.id, numero_revisao=2, data_agendada=revisoes["rev_2"], status=StatusRevisaoEnum.PENDENTE)
            rev3 = Revisao(aula_id=ultima_aula.id, numero_revisao=3, data_agendada=revisoes["rev_3"], status=StatusRevisaoEnum.PENDENTE)
            db.add_all([rev1, rev2, rev3])
        else:
            ultima_aula.data_aula = hoje
            revisoes = agendar_revisoes(hoje)
            for r in ultima_aula.revisoes:
                if r.numero_revisao == 1:
                    r.data_agendada = revisoes["rev_1"]
                elif r.numero_revisao == 2:
                    r.data_agendada = revisoes["rev_2"]
                elif r.numero_revisao == 3:
                    r.data_agendada = revisoes["rev_3"]
    else:
        aulas = db.query(Aula).filter(Aula.subtopico_id == subtopico_id).all()
        for aula in aulas:
            db.delete(aula)

    db.commit()
    db.refresh(subtopico)
    return {"status": "sucesso", "estudo_base": subtopico.estudo_base}

@router.patch("/subtopicos/{subtopico_id}/acertos")
def atualizar_acertos_subtopico(subtopico_id: int, valor: int, db: Session = Depends(get_db)):
    """Atualiza a quantidade de acertos (0 a 20) e recalcula o aproveitamento."""
    if not (0 <= valor <= 20):
        raise HTTPException(status_code=400, detail="Os acertos devem estar entre 0 e 20.")
        
    subtopico = db.query(Subtopico).filter(Subtopico.id == subtopico_id).first()
    if not subtopico:
        raise HTTPException(status_code=404, detail="Subtópico não encontrado")
        
    # Atualiza acertos e recalcula o percentual com base em 20 questões
    subtopico.questoes_acertos = valor
    subtopico.questoes_percentual = round((valor / 20.0) * 100, 1)
    
    db.commit()
    return {
        "status": "sucesso", 
        "acertos": subtopico.questoes_acertos, 
        "aproveitamento": subtopico.questoes_percentual
    }