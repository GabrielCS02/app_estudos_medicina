import React, { useState, useEffect } from "react";
import api from "../services/api";
import TabelaPlanilha from "../components/TabelaPlanilha";
import ModalTopico from "../components/ModalTopico";
import ModalSubtopico from "../components/ModalSubtopico";
import ModalMateria from "../components/ModalMateria";

export default function PainelMaterias() {
  const [materiasComDetalhes, setMateriasComDetalhes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState({});

  // Estados dos Modais
  const [isMateriaModalOpen, setMateriaModalOpen] = useState(false);
  const [isTopicModalOpen, setTopicModalOpen] = useState(false);
  const [isSubtopicModalOpen, setSubtopicModalOpen] = useState(false);

  const [activeMateriaId, setActiveMateriaId] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);

  const themeColors = [
    "bg-sky-100",
    "bg-emerald-100",
    "bg-fuchsia-100",
    "bg-amber-100",
    "bg-indigo-100",
    "bg-rose-100",
    "bg-teal-100",
    "bg-violet-100",
  ];

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await api.get("/materias/");
      const lista = res.data;
      const promessas = lista.map((m) =>
        api.get(`/materias/${m.id}/detalhes`).then((r) => r.data),
      );
      const resultados = await Promise.all(promessas);
      setMateriasComDetalhes(resultados);

      setExpanded((prev) => {
        const expInit = { ...prev };
        resultados.forEach((m) => {
          if (expInit[m.id] === undefined) expInit[m.id] = true;
        });
        return expInit;
      });
    } catch (error) {
      console.error("Erro ao carregar dados das matérias", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const toggleExpand = (materiaId) => {
    setExpanded((prev) => ({ ...prev, [materiaId]: !prev[materiaId] }));
  };

  const handleSaveMateria = async (nomeMateria, nomeTopico) => {
    try {
      const resMat = await api.post(
        `/materias/?nome=${encodeURIComponent(nomeMateria)}`,
      );
      const materiaId = resMat.data.materia_id;

      // Cria o tópico inicial sem estudo base obrigatório na raiz
      await api.post(
        `/materias/${materiaId}/topicos/?nome=${encodeURIComponent(nomeTopico)}&estudo_base=false`,
      );

      setMateriaModalOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao cadastrar matéria e tópico.");
    }
  };

  const handleSaveTopic = async (nome, estudoBase) => {
    try {
      await api.post(
        `/materias/${activeMateriaId}/topicos/?nome=${encodeURIComponent(nome)}&estudo_base=${estudoBase}`,
      );
      setTopicModalOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao criar tópico.");
    }
  };

  const handleSaveSubtopic = async (nome, dificuldade) => {
    try {
      await api.post(
        `/topicos/${activeTopicId}/subtopicos/?nome=${encodeURIComponent(nome)}&dificuldade=${dificuldade}`,
      );
      setSubtopicModalOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao criar subtópico.");
    }
  };

  const toggleStatusRevisao = (materiaId, topicoIdx, subIdx, revNumero) => {
    const novas = [...materiasComDetalhes];
    const mat = novas.find((m) => m.id === materiaId);
    if (mat) {
      const revisoes = mat.topicos[topicoIdx].subtopicos[subIdx].aula.revisoes;
      const revIndex = revisoes.findIndex((r) => r.numero === revNumero);
      if (revIndex !== -1) {
        revisoes[revIndex].status =
          revisoes[revIndex].status === "Pendente" ? "Concluída" : "Pendente";
        setMateriasComDetalhes(novas);
      }
    }
  };

  const getCorTag = (corEnum) => {
    switch (corEnum) {
      case "Verde":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Amarelo":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "Vermelho":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">
        A carregar matérias...
      </div>
    );

  return (
    <div className="p-6 max-w-[95%] mx-auto space-y-8 bg-gray-50 min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Planilha de Acompanhamento
        </h1>
        <button
          onClick={() => setMateriaModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-md shadow transition flex items-center gap-2"
        >
          <span>+ Cadastrar Matéria</span>
        </button>
      </div>

      {materiasComDetalhes.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500 italic border rounded-lg shadow-sm">
          Nenhuma matéria cadastrada. Clique no botão acima para começar.
        </div>
      ) : (
        materiasComDetalhes.map((detalhes) => {
          const isExpanded = expanded[detalhes.id];

          return (
            <div
              key={detalhes.id}
              className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden mb-6"
            >
              {/* Barra Azul Clicável da Matéria */}
              <div
                onClick={() => toggleExpand(detalhes.id)}
                className="bg-blue-800 text-white p-4 flex justify-between items-center cursor-pointer hover:bg-blue-700 transition select-none border-b-4 border-blue-600"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold uppercase tracking-wider">
                    {detalhes.nome}
                  </span>
                  <span className="text-blue-200 text-sm font-medium">
                    Tópicos: {detalhes.topicos.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMateriaId(detalhes.id);
                      setTopicModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded shadow transition"
                  >
                    + Novo Tópico
                  </button>
                  <span className="text-blue-200 text-lg font-bold">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Tabela de Dados Expandida (Removido o cabeçalho interno duplicado da matéria) */}
              {isExpanded && (
                <TabelaPlanilha
                  detalhes={detalhes}
                  themeColors={themeColors}
                  onOpenSubtopicModal={(topicoId) => {
                    setActiveTopicId(topicoId);
                    setSubtopicModalOpen(true);
                  }}
                  onToggleRevisao={(topIdx, subIdx, revNum) =>
                    toggleStatusRevisao(detalhes.id, topIdx, subIdx, revNum)
                  }
                  getCorTag={getCorTag}
                  ocultarCabecalhoMateria={true}
                />
              )}
            </div>
          );
        })
      )}

      {/* Modais de Cadastro */}
      <ModalMateria
        isOpen={isMateriaModalOpen}
        onClose={() => setMateriaModalOpen(false)}
        onSave={handleSaveMateria}
      />
      <ModalTopico
        isOpen={isTopicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        onSave={handleSaveTopic}
      />
      <ModalSubtopico
        isOpen={isSubtopicModalOpen}
        onClose={() => setSubtopicModalOpen(false)}
        onSave={handleSaveSubtopic}
      />
    </div>
  );
}
