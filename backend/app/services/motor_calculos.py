# backend/app/services/motor_calculos.py

def classificar_dificuldade_cor(grau: int) -> str:
    """
    Regra A7: Converte o grau de dificuldade em cor para a UI.
    """
    if 0 <= grau <= 3:
        return "Verde"
    elif 4 <= grau <= 7:
        return "Amarelo"
    elif 8 <= grau <= 10:
        return "Vermelho"
    else:
        raise ValueError("A dificuldade deve estar entre 0 e 10.")