# backend/app/seeder.py

from datetime import date, timedelta
from app.core.database import SessionLocal
from app.models.schema_db import Materia, Avaliacao, TipoAvaliacaoEnum, StatusAvaliacaoEnum

def popular_banco_teste():
    db = SessionLocal()
    
    # Cria Matéria Fictícia
    nova_materia = Materia(nome="Anatomia")
    db.add(nova_materia)
    db.commit()
    db.refresh(nova_materia)
    
    # Cria Prova Próxima para testar o Alerta de 7 Dias
    nova_avaliacao = Avaliacao(
        materia_id=nova_materia.id,
        tipo_avaliacao=TipoAvaliacaoEnum.PROVA_PRATICA,
        conteudo_cobrado="Membro Superior",
        data=date.today() + timedelta(days=3), # Cai na regra do alerta
        valor=10.0,
        status=StatusAvaliacaoEnum.PENDENTE
    )
    db.add(nova_avaliacao)
    db.commit()
    
    print("Banco populado com dados de teste com sucesso.")
    db.close()

if __name__ == "__main__":
    popular_banco_teste()