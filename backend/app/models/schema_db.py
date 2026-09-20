# backend/app/models/schema_db.py

import enum
from datetime import date
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# Classe Base do SQLAlchemy 2.0
class Base(DeclarativeBase):
    pass

# ==========================================
# ENUMS (Regras de Negócio e Campos Restritos)
# ==========================================

class TipoAvaliacaoEnum(enum.Enum):
    SEMINARIO = "Seminário"
    RELATORIO_LAB = "Relatório de Laboratório"
    OSCE = "OSCE"
    PROVA_PRATICA = "Prova Prática"
    PROVA_TEORICA = "Prova Teórica"
    ESTUDO_CASO = "Estudo de Caso"
    TRABALHO_ARTIGO = "Trabalho / Artigo"
    SIMULADO = "Simulado"

class StatusAvaliacaoEnum(enum.Enum):
    EM_ANDAMENTO = "Em Andamento"
    PENDENTE = "Pendente"
    CONCLUIDO = "Concluído"

class DificuldadeCorEnum(enum.Enum):
    VERDE = "Verde"       # Grau 0 a 3
    AMARELO = "Amarelo"   # Grau 4 a 7
    VERMELHO = "Vermelho" # Grau 8 a 10

class StatusRevisaoEnum(enum.Enum):
    PENDENTE = "Pendente"
    CONCLUIDA = "Concluída"
    ATRASADA = "Atrasada"

# ==========================================
# TABELAS DE HIERARQUIA DE ESTUDOS
# ==========================================

class Materia(Base):
    __tablename__ = "materias"
    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Relacionamentos (1 para N)
    topicos: Mapped[List["Topico"]] = relationship(back_populates="materia", cascade="all, delete")
    avaliacoes: Mapped[List["Avaliacao"]] = relationship(back_populates="materia")

class Topico(Base):
    __tablename__ = "topicos"
    id: Mapped[int] = mapped_column(primary_key=True)
    materia_id: Mapped[int] = mapped_column(ForeignKey("materias.id"))
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    
    # Regra A4: Estudo base voltado para o tópico
    estudo_base: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relacionamentos
    materia: Mapped["Materia"] = relationship(back_populates="topicos")
    subtopicos: Mapped[List["Subtopico"]] = relationship(back_populates="topico", cascade="all, delete")

class Subtopico(Base):
    __tablename__ = "subtopicos"
    id: Mapped[int] = mapped_column(primary_key=True)
    topico_id: Mapped[int] = mapped_column(ForeignKey("topicos.id"))
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    
    # Regra de Estudo Base movida/ajustada para o Subtópico
    estudo_base: Mapped[bool] = mapped_column(Boolean, default=False)
    
    dificuldade_grau: Mapped[int] = mapped_column(Integer, nullable=False) 
    dificuldade_cor: Mapped[DificuldadeCorEnum] = mapped_column(SAEnum(DificuldadeCorEnum), nullable=False)
    
    questoes_acertos: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    questoes_percentual: Mapped[Optional[float]] = mapped_column(Float, default=0.0) 
    
    topico: Mapped["Topico"] = relationship(back_populates="subtopicos")
    aulas: Mapped[List["Aula"]] = relationship(back_populates="subtopico", cascade="all, delete")
    __tablename__ = "subtopicos"
    id: Mapped[int] = mapped_column(primary_key=True)
    topico_id: Mapped[int] = mapped_column(ForeignKey("topicos.id"))
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    
    # Regra A3 e A7: Dificuldade do subtópico
    dificuldade_grau: Mapped[int] = mapped_column(Integer, nullable=False) 
    dificuldade_cor: Mapped[DificuldadeCorEnum] = mapped_column(SAEnum(DificuldadeCorEnum), nullable=False)
    
    # Regra A5: Questões
    questoes_acertos: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    questoes_percentual: Mapped[Optional[float]] = mapped_column(Float, default=0.0) 
    
    # Relacionamentos
    topico: Mapped["Topico"] = relationship(back_populates="subtopicos")
    aulas: Mapped[List["Aula"]] = relationship(back_populates="subtopico", cascade="all, delete")

# ==========================================
# TABELAS DE ACOMPANHAMENTO (AULAS E REVISÕES)
# ==========================================

class Aula(Base):
    """
    A2 - Registra a data em que o subtópico foi estudado.
    Serve como âncora cronológica para calcular as datas das revisões.
    """
    __tablename__ = "aulas"
    id: Mapped[int] = mapped_column(primary_key=True)
    subtopico_id: Mapped[int] = mapped_column(ForeignKey("subtopicos.id"))
    data_aula: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Relacionamentos
    subtopico: Mapped["Subtopico"] = relationship(back_populates="aulas")
    revisoes: Mapped[List["Revisao"]] = relationship(back_populates="aula", cascade="all, delete")

class Revisao(Base):
    """
    A6 - As três revisões espaçadas no tempo (1 a 2 dias, 7 dias, 30 dias)
    """
    __tablename__ = "revisoes"
    id: Mapped[int] = mapped_column(primary_key=True)
    aula_id: Mapped[int] = mapped_column(ForeignKey("aulas.id"))
    numero_revisao: Mapped[int] = mapped_column(Integer, nullable=False) # 1, 2 ou 3
    data_agendada: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[StatusRevisaoEnum] = mapped_column(SAEnum(StatusRevisaoEnum), default=StatusRevisaoEnum.PENDENTE)
    
    # Relacionamentos
    aula: Mapped["Aula"] = relationship(back_populates="revisoes")

# ==========================================
# TABELA DE CRONOGRAMA DE AVALIAÇÕES E PROVAS (B1)
# ==========================================

class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    id: Mapped[int] = mapped_column(primary_key=True)
    materia_id: Mapped[int] = mapped_column(ForeignKey("materias.id")) 
    
    tipo_avaliacao: Mapped[TipoAvaliacaoEnum] = mapped_column(SAEnum(TipoAvaliacaoEnum), nullable=False)
    conteudo_cobrado: Mapped[str] = mapped_column(String(255), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    
    valor: Mapped[float] = mapped_column(Float, nullable=False)
    nota_obtida: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    status: Mapped[StatusAvaliacaoEnum] = mapped_column(SAEnum(StatusAvaliacaoEnum), nullable=False)
    
    # Relacionamentos
    materia: Mapped["Materia"] = relationship(back_populates="avaliacoes")