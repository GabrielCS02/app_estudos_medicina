import React, { useState, useEffect } from "react";
import api from "../services/api";
import ModalAvaliacao from "../components/ModalAvaliacao";

export default function CronogramaAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tiposAvaliacao = [
    "Seminário",
    "Relatório de Laboratório",
    "OSCE",
    "Prova Prática",
    "Prova Teórica",
    "Estudo de Caso",
    "Trabalho / Artigo",
    "Outro"
  ];

  const carregarDados = async () => {
    try {
      const response = await api.get("/cronograma");
      setAvaliacoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar o cronograma:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovaAvaliacao = async (dadosNovaAvaliacao) => {
    try {
      await api.post("/avaliacoes/", dadosNovaAvaliacao);
      setIsModalOpen(false);
      carregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar a avaliação.");
    }
  };

  const handleUpdateInline = async (index, campo, valor) => {
    const novasAvaliacoes = [...avaliacoes];
    novasAvaliacoes[index][campo] = valor;
    setAvaliacoes(novasAvaliacoes);

    const avaliacao = novasAvaliacoes[index];
    try {
      await api.patch(`/avaliacoes/${avaliacao.id}`, {
        [campo]: valor
      });
    } catch (error) {
      console.error("Erro ao atualizar avaliação:", error);
    }
  };

  const getDiasRestantes = (dataStr) => {
    if (!dataStr) return 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = dataStr.split("T")[0].split("-").map(Number);
    const dataProva = new Date(ano, mes - 1, dia);
    dataProva.setHours(0, 0, 0, 0);

    const diffTempo = dataProva - hoje;
    return Math.round(diffTempo / (1000 * 60 * 60 * 24));
  };

  const getEstiloLinha = (dias, notaObtida) => {
    const jaFoiFeita = dias < 0 || (notaObtida !== null && notaObtida !== "" && notaObtida !== undefined);

    if (jaFoiFeita) {
      return {
        rowClass: "bg-gray-100/90 hover:bg-gray-200/80 text-gray-500 border-gray-200",
        badgeClass: "bg-gray-200 text-gray-600 font-semibold",
        badgeTexto: "Realizada"
      };
    }

    if (dias >= 0 && dias <= 3) {
      return {
        rowClass: "bg-red-50 hover:bg-red-100 text-red-950 border-red-200",
        badgeClass: dias === 0 ? "bg-red-600 text-white font-bold animate-pulse" : "bg-red-200 text-red-900 font-bold",
        badgeTexto: dias === 0 ? "Hoje" : dias === 1 ? "1 dia" : `${dias} dias`
      };
    }

    return {
      rowClass: "bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200",
      badgeClass: "bg-amber-200 text-amber-900 font-semibold",
      badgeTexto: `${dias} dias`
    };
  };

  const renderPercentualAcerto = (nota, valor) => {
    if (nota === null || nota === undefined || nota === "" || !valor || valor <= 0) {
      return <span className="text-gray-400 font-medium">-</span>;
    }

    const percentual = Math.min(Math.max((Number(nota) / Number(valor)) * 100, 0), 100);
    
    let corBadge = "bg-green-100 text-green-800 border-green-300";
    if (percentual < 50) {
      corBadge = "bg-red-100 text-red-800 border-red-300";
    } else if (percentual < 70) {
      corBadge = "bg-yellow-100 text-yellow-800 border-yellow-300";
    }

    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border shadow-xs inline-block ${corBadge}`}>
        {percentual.toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600 font-medium">
        Carregando cronograma...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Cronograma de Avaliações e Provas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhamento de prazos, pontuações e taxa de acerto por avaliação.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm font-medium"
        >
          + Nova Avaliação
        </button>
      </div>

      <div className="flex flex-wrap gap-5 text-xs font-medium text-gray-600 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-200 border border-red-400"></span>
          <span>Próxima (0 a 3 dias)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-200 border border-amber-400"></span>
          <span>Mais de 3 dias</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-gray-200 border border-gray-400"></span>
          <span>Prova já realizada</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Disciplina</th>
                <th className="p-4 font-semibold">Tipo de Avaliação</th>
                <th className="p-4 font-semibold">Conteúdo Cobrado</th>
                <th className="p-4 font-semibold text-center">Data</th>
                <th className="p-4 font-semibold text-center">Dias Restantes</th>
                <th className="p-4 font-semibold text-center">Valor</th>
                <th className="p-4 font-semibold text-center">Nota Obtida</th>
                <th className="p-4 font-semibold text-center">% Acerto</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {avaliacoes.map((aval, index) => {
                const dias = getDiasRestantes(aval.data);
                const { rowClass, badgeClass, badgeTexto } = getEstiloLinha(dias, aval.nota_obtida);

                return (
                  <tr key={aval.id || index} className={`transition border-b ${rowClass}`}>
                    <td className="p-4 font-bold">{aval.disciplina}</td>

                    <td className="p-4">
                      <select
                        className="border border-gray-300 rounded p-1.5 bg-white/90 focus:ring-blue-500 focus:border-blue-500 w-full text-xs font-medium text-gray-800 shadow-sm"
                        value={aval.tipo_avaliacao}
                        onChange={(e) => handleUpdateInline(index, "tipo_avaliacao", e.target.value)}
                      >
                        {tiposAvaliacao.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 truncate max-w-xs font-medium">{aval.conteudo_cobrado}</td>

                    <td className="p-4 text-center font-medium">
                      {new Date(aval.data).toLocaleDateString("pt-BR")}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs shadow-sm inline-block ${badgeClass}`}>
                        {badgeTexto}
                      </span>
                    </td>

                    <td className="p-4 text-center font-medium">
                      {Number(aval.valor).toFixed(1)}
                    </td>

                    <td className="p-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        className="w-16 border border-gray-300 rounded p-1 text-center font-bold bg-white focus:ring-blue-500 shadow-sm text-gray-800"
                        value={aval.nota_obtida ?? ""}
                        placeholder="-"
                        onChange={(e) =>
                          handleUpdateInline(
                            index,
                            "nota_obtida",
                            e.target.value === "" ? null : parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td className="p-4 text-center">
                      {renderPercentualAcerto(aval.nota_obtida, aval.valor)}
                    </td>
                  </tr>
                );
              })}

              {avaliacoes.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    Nenhuma avaliação cadastrada no momento. Clique em "+ Nova Avaliação" acima para adicionar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalAvaliacao
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSalvarNovaAvaliacao}
      />
    </div>
  );
}