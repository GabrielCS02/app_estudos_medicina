# backend/app/api/rotas_estudos.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta

# router substitui o 'app' para permitir a modularização
router = APIRouter(tags=["Estudos e Estrutura"])

# --- Regras de Negócio Internas ---
def calcular_percentual_acertos(acertos: int) -> float:
    total_questoes = 20
    if acertos < 0 or acertos > total_questoes:
        raise ValueError("O número de acertos deve ser entre 0 e 20.")
    return round((acertos / total_questoes) * 100, 2)

def agendar_revisoes(data_aula: date) -> dict:
    return {
        "rev_1": data_aula + timedelta(days=1),
        "rev_2": data_aula + timedelta(days=7),
        "rev_3": data_aula + timedelta(days=30)
    }

# --- Rotas de Hierarquia e Execução ---

@router.post("/materias/")
def criar_materia(nome: str):
    # Lógica de inserção no banco
    return {"status": "sucesso", "mensagem": f"Matéria {nome} criada."}

@router.get("/materias/")
def listar_materias():
    return [{"id": 1, "nome": "Anatomia"}]

@router.post("/materias/{materia_id}/topicos/")
def criar_topico(materia_id: int, nome: str, estudo_base: bool):
    return {"status": "sucesso", "topico": nome, "estudo_base_realizado": estudo_base}

@router.post("/topicos/{topico_id}/subtopicos/")
def criar_subtopico(topico_id: int, nome: str, dificuldade: int):
    if not (0 <= dificuldade <= 10):
        raise HTTPException(status_code=400, detail="A dificuldade deve estar entre 0 e 10.")
    
    cor = "Verde" if dificuldade <= 3 else "Amarelo" if dificuldade <= 7 else "Vermelho"
    
    return {
        "status": "sucesso",
        "nome": nome,
        "dificuldade": dificuldade,
        "classificacao_cor": cor
    }

@router.post("/subtopicos/{subtopico_id}/registrar-aula")
def registrar_aula(subtopico_id: int, data_aula: date, acertos: int):
    revisoes = agendar_revisoes(data_aula)
    percentual = calcular_percentual_acertos(acertos)
    
    return {
        "status": "Aula registrada e revisões agendadas.",
        "datas_revisao": revisoes,
        "desempenho_questoes": {"acertos": acertos, "percentual": percentual}
    }