from datetime import date, timedelta

def classificar_dificuldade_cor(grau: int) -> str:
    """Regra A7: Converte o grau de dificuldade (0-10) em cor."""
    if 0 <= grau <= 3:
        return "Verde"
    elif 4 <= grau <= 7:
        return "Amarelo"
    elif 8 <= grau <= 10:
        return "Vermelho"
    else:
        raise ValueError("A dificuldade deve estar entre 0 e 10.")

def calcular_percentual_acertos(acertos: int) -> float:
    """Regra A5: Calcula o percentual baseado no bloco de 20 questões."""
    total_questoes = 20
    if acertos < 0 or acertos > total_questoes:
        raise ValueError("O número de acertos deve ser entre 0 e 20.")
    return round((acertos / total_questoes) * 100, 2)

def agendar_revisoes(data_aula: date) -> dict:
    """Regra A6: Calcula as datas exatas para repetição espaçada (1, 7 e 30 dias)."""
    return {
        "rev_1": data_aula + timedelta(days=1),
        "rev_2": data_aula + timedelta(days=7),
        "rev_3": data_aula + timedelta(days=30)
    }