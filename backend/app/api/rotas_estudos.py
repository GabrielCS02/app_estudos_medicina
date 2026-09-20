from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import func

# Importações da nossa arquitetura
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
    calcular_percentual_acertos,
    agendar_revisoes,
    classificar_dificuldade_cor
)

router = APIRouter(tags=["Estudos e Estrutura"])

# ==========================================
# ROTAS DE HIERARQUIA E CADASTRO (Regras A1 a A4 e A7)
# ==========================================

@router.post("/materias/")
def criar_materia(nome: str, db: Session = Depends(get_db)):
    """Cria uma nova matéria garantindo que não haja duplicatas por erro de digitação."""
    # Remove espaços em branco antes e depois do texto
    nome_limpo = nome.strip()
    
    # Faz uma busca no banco ignorando maiúsculas e minúsculas (func.lower)
    materia_existente = db.query(Materia).filter(
        func.lower(Materia.nome) == nome_limpo.lower()
    ).first()
    
    if materia_existente:
        # Se já existir, retorna o ID da matéria existente para não duplicar
        return {"status": "existente", "materia_id": materia_existente.id, "nome": materia_existente.nome}
        
    nova_materia = Materia(nome=nome_limpo)
    db.add(nova_materia)
    db.commit()
    db.refresh(nova_materia)
    
    return {"status": "sucesso", "materia_id": nova_materia.id, "nome": nova_materia.nome}

@router.get("/materias/")
def listar_materias(db: Session = Depends(get_db)):
    """Retorna a lista real de matérias cadastradas no banco."""
    materias = db.query(Materia).all()
    return [{"id": m.id, "nome": m.nome} for m in materias]

@router.get("/materias/{materia_id}/detalhes")
def obter_detalhes_materia(materia_id: int, db: Session = Depends(get_db)):
    """
    Busca a hierarquia completa: Matéria -> Tópicos -> Subtópicos -> Aula -> Revisões.
    """
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
                "estudo_base": s.estudo_base, # Adicionado aqui
                "dificuldade_cor": s.dificuldade_cor.value,
                "aproveitamento": s.questoes_percentual,
                "aula": aula_data
            })
        resultado["topicos"].append(topico_dict)
        
    return resultado

@router.post("/materias/{materia_id}/topicos/")
def criar_topico(materia_id: int, nome: str, estudo_base: bool = False, db: Session = Depends(get_db)):
    """Cria um novo tópico atrelado a uma matéria."""
    novo_topico = Topico(materia_id=materia_id, nome=nome, estudo_base=estudo_base)
    db.add(novo_topico)
    db.commit()
    db.refresh(novo_topico)
    return {"status": "sucesso", "topico_id": novo_topico.id, "nome": novo_topico.nome}

@router.post("/topicos/{topico_id}/subtopicos/")
def criar_subtopico(topico_id: int, nome: str, dificuldade: int, db: Session = Depends(get_db)):
    """Cria um novo subtópico e já converte a dificuldade (0-10) em Cor (A3, A7)[cite: 4]."""
    if not (0 <= dificuldade <= 10):
        raise HTTPException(status_code=400, detail="A dificuldade deve estar entre 0 e 10.")
    
    cor_str = classificar_dificuldade_cor(dificuldade)
    cor_enum = DificuldadeCorEnum(cor_str)
    
    novo_subtopico = Subtopico(
        topico_id=topico_id, 
        nome=nome, 
        dificuldade_grau=dificuldade, 
        dificuldade_cor=cor_enum
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

@router.patch("/subtopicos/{subtopico_id}/toggle-estudo-base")
def toggle_estudo_base(subtopico_id: int, db: Session = Depends(get_db)):
    """Alterna o status do Estudo Base de um subtópico específico."""
    subtopico = db.query(Subtopico).filter(Subtopico.id == subtopico_id).first()
    if not subtopico:
        raise HTTPException(status_code=404, detail="Subtópico não encontrado")
    
    subtopico.estudo_base = not subtopico.estudo_base
    db.commit()
    db.refresh(subtopico)
    return {"status": "sucesso", "estudo_base": subtopico.estudo_base}
@router.get("/subtopicos/")
def listar_subtopicos(db: Session = Depends(get_db)):
    """Retorna todos os subtópicos reais do banco para alimentar a barra de Autocomplete."""
    subtopicos = db.query(Subtopico).all()
    # Retorna o ID e uma string formatada contendo o nome do subtópico para facilitar a busca do usuário
    return [{"id": s.id, "nome": f"{s.nome} ({s.topico.materia.nome if s.topico and s.topico.materia else 'Sem Matéria'})"} for s in subtopicos]

# ==========================================
# ROTAS DE AULAS E REVISÕES (Regras A5 e A6)
# ==========================================

@router.post("/subtopicos/{subtopico_id}/registrar-aula")
def registrar_aula(subtopico_id: int, data_aula: date, acertos: int, db: Session = Depends(get_db)):
    """
    Recebe o input de uma aula, calcula percentuais, atualiza o subtópico e agenda as 3 revisões[cite: 4].
    """
    subtopico = db.query(Subtopico).filter(Subtopico.id == subtopico_id).first()
    if not subtopico:
         raise HTTPException(status_code=404, detail="Subtópico não encontrado")

    # 1. Utiliza o motor de cálculos para gerar as métricas
    revisoes = agendar_revisoes(data_aula)
    percentual = calcular_percentual_acertos(acertos)
    
    # 2. Atualiza a pontuação do subtópico no banco de dados
    subtopico.questoes_acertos = acertos
    subtopico.questoes_percentual = percentual
    
    # 3. Registra a data da Aula como âncora cronológica
    nova_aula = Aula(subtopico_id=subtopico_id, data_aula=data_aula)
    db.add(nova_aula)
    db.flush() # Processa no banco para gerar o ID da aula antes do commit final
    
    # 4. Registra as 3 instâncias de Revisão atreladas a esta aula
    rev1 = Revisao(aula_id=nova_aula.id, numero_revisao=1, data_agendada=revisoes["rev_1"], status=StatusRevisaoEnum.PENDENTE)
    rev2 = Revisao(aula_id=nova_aula.id, numero_revisao=2, data_agendada=revisoes["rev_2"], status=StatusRevisaoEnum.PENDENTE)
    rev3 = Revisao(aula_id=nova_aula.id, numero_revisao=3, data_agendada=revisoes["rev_3"], status=StatusRevisaoEnum.PENDENTE)
    
    db.add_all([rev1, rev2, rev3])
    db.commit() # Salva tudo de uma vez garantindo a integridade dos dados
    
    return {
        "status": "Aula e revisões gravadas com sucesso no banco de dados.",
        "datas_revisao": revisoes,
        "desempenho_questoes": {"acertos": acertos, "percentual": percentual}
    }