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
      alert("Erro ao registar a avaliação.");
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

  // Regras visuais com a nova paleta pastel
  const getEstiloLinha = (dias, notaObtida) => {
    const jaFoiFeita = dias < 0 || (notaObtida !== null && notaObtida !== "" && notaObtida !== undefined);

    if (jaFoiFeita) {
      return {
        rowClass: "bg-slate-50/30 hover:bg-slate-50 text-slate-500",
        badgeClass: "bg-slate-100 text-slate-500",
        badgeTexto: "Realizada"
      };
    }

    if (dias >= 0 && dias <= 3) {
      return {
        rowClass: "hover:bg-rose-50/30 text-slate-800",
        badgeClass: dias === 0 ? "bg-rose-500 text-white animate-pulse" : "bg-rose-50 text-rose-600",
        badgeTexto: dias === 0 ? "Hoje" : dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`
      };
    }

    return {
      rowClass: "hover:bg-[#F8FBFB] text-slate-800",
      badgeClass: "bg-[#E5F3F1] text-[#0D8A72]",
      badgeTexto: `Faltam ${dias} dias`
    };
  };

  const renderPercentualAcerto = (nota, valor) => {
    if (nota === null || nota === undefined || nota === "" || !valor || valor <= 0) {
      return <span className="text-slate-300 font-medium">-</span>;
    }

    const percentual = Math.min(Math.max((Number(nota) / Number(valor)) * 100, 0), 100);
    
    let corBadge = "bg-[#E5F3F1] text-[#0D8A72]";
    if (percentual < 50) {
      corBadge = "bg-rose-50 text-rose-600";
    } else if (percentual < 70) {
      corBadge = "bg-amber-50 text-amber-600";
    }

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider inline-block ${corBadge}`}>
        {percentual.toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F7F7]">
        <div className="w-12 h-12 border-4 border-[#D0EBE7] border-t-[#0D8A72] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-[#F0F7F7] font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D5C53] tracking-tight">
              Cronograma de Provas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhamento de prazos, avaliações e métricas de acerto.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0D8A72] hover:bg-[#0D5C53] text-white font-bold py-3 px-6 rounded-full shadow-[0_8px_30px_rgb(13,138,114,0.2)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap text-sm sm:text-base"
          >
            + Nova Avaliação
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.08)] flex flex-col overflow-hidden p-2">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] p-2">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-100">
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Disciplina</th>
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Tipo</th>
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Conteúdo</th>
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Data</th>
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Prazo</th>
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Valor</th>
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Nota</th>
                  <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">% Acerto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {avaliacoes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">
                      Nenhuma avaliação agendada.
                    </td>
                  </tr>
                ) : (
                  avaliacoes.map((aval, index) => {
                    const dias = getDiasRestantes(aval.data);
                    const { rowClass, badgeClass, badgeTexto } = getEstiloLinha(dias, aval.nota_obtida);

                    return (
                      <tr key={aval.id || index} className={`transition-colors ${rowClass}`}>
                        <td className="p-4 font-bold text-[#0D5C53] text-sm">{aval.disciplina}</td>

                        <td className="p-4">
                          <select
                            className="bg-transparent border border-slate-200 hover:border-[#D0EBE7] text-slate-600 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#0D8A72] focus:border-[#0D8A72] outline-none transition w-full shadow-sm cursor-pointer"
                            value={aval.tipo_avaliacao}
                            onChange={(e) => handleUpdateInline(index, "tipo_avaliacao", e.target.value)}
                          >
                            {tiposAvaliacao.map((tipo) => (
                              <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-4 text-sm text-slate-500 truncate max-w-[150px]" title={aval.conteudo_cobrado}>
                          {aval.conteudo_cobrado}
                        </td>

                        <td className="p-4 text-center font-medium text-slate-600 text-sm">
                          {new Date(aval.data).toLocaleDateString("pt-PT")}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider inline-block min-w-[90px] ${badgeClass}`}>
                            {badgeTexto}
                          </span>
                        </td>

                        <td className="p-4 text-center font-medium text-slate-500 text-sm">
                          {Number(aval.valor).toFixed(1)}
                        </td>

                        <td className="p-4 text-center align-middle">
                          <input
                            type="number"
                            step="0.1"
                            className="w-16 bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-2 text-center font-bold text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] outline-none shadow-inner transition-all"
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
    </div>
  );
}