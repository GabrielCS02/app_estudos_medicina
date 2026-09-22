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
    "Outro",
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
    // Atualização otimista na interface
    const novasAvaliacoes = [...avaliacoes];
    novasAvaliacoes[index][campo] = valor;
    setAvaliacoes(novasAvaliacoes);

    // Salva no banco de dados
    const avaliacao = novasAvaliacoes[index];
    try {
      await api.patch(`/avaliacoes/${avaliacao.id}`, {
        [campo]: valor,
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

  // Regras de negócio visuais mescladas ao padrão Premium
  const getEstiloLinha = (dias, notaObtida) => {
    const jaFoiFeita =
      dias < 0 ||
      (notaObtida !== null && notaObtida !== "" && notaObtida !== undefined);

    if (jaFoiFeita) {
      return {
        rowClass: "bg-slate-50/50 hover:bg-slate-100/50 text-slate-500",
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
        badgeTexto: "Realizada",
      };
    }

    if (dias >= 0 && dias <= 3) {
      return {
        rowClass: "bg-red-50/30 hover:bg-red-50 text-slate-800",
        badgeClass:
          dias === 0
            ? "bg-red-500 text-white animate-pulse border-red-600"
            : "bg-red-50 text-red-600 border-red-200",
        badgeTexto:
          dias === 0 ? "Hoje" : dias === 1 ? "1 dia" : `Faltam ${dias} dias`,
      };
    }

    return {
      rowClass: "bg-white hover:bg-slate-50 text-slate-800",
      badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
      badgeTexto: `Faltam ${dias} dias`,
    };
  };

  const renderPercentualAcerto = (nota, valor) => {
    if (
      nota === null ||
      nota === undefined ||
      nota === "" ||
      !valor ||
      valor <= 0
    ) {
      return <span className="text-slate-300 font-medium">-</span>;
    }

    const percentual = Math.min(
      Math.max((Number(nota) / Number(valor)) * 100, 0),
      100,
    );

    let corBadge = "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (percentual < 50) {
      corBadge = "bg-red-50 text-red-600 border-red-200";
    } else if (percentual < 70) {
      corBadge = "bg-amber-50 text-amber-600 border-amber-200";
    }

    return (
      <span
        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm inline-block ${corBadge}`}
      >
        {percentual.toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
        A carregar cronograma...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cronograma de Provas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhamento de prazos, pontuações e taxa de acerto por avaliação.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-full shadow-md shadow-blue-200 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          + Nova Avaliação
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 p-2 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] p-2">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="border-b border-slate-100">
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                  Disciplina
                </th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                  Tipo
                </th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                  Conteúdo
                </th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">
                  Data
                </th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">
                  Prazo
                </th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">
                  Valor
                </th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">
                  Nota
                </th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">
                  % Acerto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {avaliacoes.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center text-slate-400 font-medium"
                  >
                    Nenhuma avaliação agendada.
                  </td>
                </tr>
              ) : (
                avaliacoes.map((aval, index) => {
                  const dias = getDiasRestantes(aval.data);
                  const { rowClass, badgeClass, badgeTexto } = getEstiloLinha(
                    dias,
                    aval.nota_obtida,
                  );

                  return (
                    <tr
                      key={aval.id || index}
                      className={`transition-colors ${rowClass}`}
                    >
                      <td className="p-3 font-bold text-slate-800 text-xs sm:text-sm">
                        {aval.disciplina}
                      </td>

                      <td className="p-3">
                        <select
                          className="bg-transparent border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition w-full shadow-sm cursor-pointer"
                          value={aval.tipo_avaliacao}
                          onChange={(e) =>
                            handleUpdateInline(
                              index,
                              "tipo_avaliacao",
                              e.target.value,
                            )
                          }
                        >
                          {tiposAvaliacao.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td
                        className="p-3 text-xs sm:text-sm text-slate-600 truncate max-w-[150px]"
                        title={aval.conteudo_cobrado}
                      >
                        {aval.conteudo_cobrado}
                      </td>

                      <td className="p-3 text-center font-medium text-slate-600 text-xs sm:text-sm">
                        {new Date(aval.data).toLocaleDateString("pt-PT")}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider border inline-block min-w-[80px] shadow-sm ${badgeClass}`}
                        >
                          {badgeTexto}
                        </span>
                      </td>

                      <td className="p-3 text-center font-medium text-slate-600 text-xs sm:text-sm">
                        {Number(aval.valor).toFixed(1)}
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="number"
                          step="0.1"
                          className="w-16 bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                          value={aval.nota_obtida ?? ""}
                          placeholder="-"
                          onChange={(e) =>
                            handleUpdateInline(
                              index,
                              "nota_obtida",
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                            )
                          }
                        />
                      </td>

                      <td className="p-3 text-center">
                        {renderPercentualAcerto(aval.nota_obtida, aval.valor)}
                      </td>
                    </tr>
                  );
                })
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
