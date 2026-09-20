# backend/app/models/schema_db.py

import enum
from datetime import date
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

# ==========================================
# ENUMS
# ==========================================

class TipoAvaliacaoEnum(enum.Enum):
    P1 = "P1"
    P2 = "P2"
    SEMINARIO = "Seminário"
    RELATORIO_LAB = "Relatório de Laboratório"
    OSCE = "OSCE"
    PROVA_PRATICA = "Prova Prática"
    ESTUDO_CASO = "Estudo de Caso"
    TRABALHO_ARTIGO = "Trabalho / Artigo"

class StatusAvaliacaoEnum(enum.Enum):
    EM_ANDAMENTO = "Em Andamento"
    PENDENTE = "Pendente"
    CONCLUIDO = "Concluído"

class DificuldadeCorEnum(enum.Enum):
    VERDE = "Verde"       # 0 a 3
    AMARELO = "Amarelo"   # 4 a 7
    VERMELHO = "Vermelho" # 8 a 10

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
    
    topicos: Mapped[List["Topico"]] = relationship(back_populates="materia", cascade="all, delete")
    avaliacoes: Mapped[List["Avaliacao"]] = relationship(back_populates="materia")

class Topico(Base):
    __tablename__ = "topicos"
    id: Mapped[int] = mapped_column(primary_key=True)
    materia_id: Mapped[int] = mapped_column(ForeignKey("materias.id"))
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    estudo_base: Mapped[bool] = mapped_column(Boolean, default=False)
    
    materia: Mapped["Materia"] = relationship(back_populates="topicos")
    subtopicos: Mapped[List["Subtopico"]] = relationship(back_populates="topico", cascade="all, delete")

class Subtopico(Base):
    __tablename__ = "subtopicos"
    id: Mapped[int] = mapped_column(primary_key=True)
    topico_id: Mapped[int] = mapped_column(ForeignKey("topicos.id"))
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    
    # Campo de Estudo Base individual do Subtópico
    estudo_base: Mapped[bool] = mapped_column(Boolean, default=False)
    
    dificuldade_grau: Mapped[int] = mapped_column(Integer, nullable=False) 
    dificuldade_cor: Mapped[DificuldadeCorEnum] = mapped_column(SAEnum(DificuldadeCorEnum), nullable=False)
    
    questoes_acertos: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    questoes_percentual: Mapped[Optional[float]] = mapped_column(Float, default=0.0) 
    
    topico: Mapped["Topico"] = relationship(back_populates="subtopicos")
    aulas: Mapped[List["Aula"]] = relationship(back_populates="subtopico", cascade="all, delete")

# ==========================================
# TABELAS DE ACOMPANHAMENTO (AULAS E REVISÕES)
# ==========================================

class Aula(Base):
    __tablename__ = "aulas"
    id: Mapped[int] = mapped_column(primary_key=True)
    subtopico_id: Mapped[int] = mapped_column(ForeignKey("subtopicos.id"))
    data_aula: Mapped[date] = mapped_column(Date, nullable=False)
    
    subtopico: Mapped["Subtopico"] = relationship(back_populates="aulas")
    revisoes: Mapped[List["Revisao"]] = relationship(back_populates="aula", cascade="all, delete")

class Revisao(Base):
    __tablename__ = "revisoes"
    id: Mapped[int] = mapped_column(primary_key=True)
    aula_id: Mapped[int] = mapped_column(ForeignKey("aulas.id"))
    numero_revisao: Mapped[int] = mapped_column(Integer, nullable=False)
    data_agendada: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[StatusRevisaoEnum] = mapped_column(SAEnum(StatusRevisaoEnum), default=StatusRevisaoEnum.PENDENTE)
    
    aula: Mapped["Aula"] = relationship(back_populates="revisoes")

# ==========================================
# TABELA DE CRONOGRAMA DE AVALIAÇÕES E PROVAS
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
    
    materia: Mapped["Materia"] = relationship(back_populates="avaliacoes")