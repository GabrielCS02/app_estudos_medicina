# backend/tests/test_calculos.py

import pytest
from datetime import date
from app.services.motor_calculos import (
    classificar_dificuldade_cor, 
    calcular_percentual_acertos, 
    agendar_revisoes
)

def test_classificar_dificuldade_cor():
    assert classificar_dificuldade_cor(2) == "Verde"
    assert classificar_dificuldade_cor(5) == "Amarelo"
    assert classificar_dificuldade_cor(9) == "Vermelho"

def test_calcular_percentual_acertos():
    # Regra A5: 100% de aproveitamento baseia-se em 20 questões
    assert calcular_percentual_acertos(15) == 75.0
    assert calcular_percentual_acertos(20) == 100.0

def test_agendar_revisoes():
    # Regra A6: As três revisões são agendadas para +1, +7 e +30 dias da aula
    data_aula = date(2026, 9, 20)
    revisoes = agendar_revisoes(data_aula)
    
    assert revisoes["rev_1"] == date(2026, 9, 21)
    assert revisoes["rev_2"] == date(2026, 9, 27)
    assert revisoes["rev_3"] == date(2026, 10, 20)