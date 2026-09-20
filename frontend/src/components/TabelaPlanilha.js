import React, { Fragment, useState, useEffect } from "react";
import api from "../services/api";

// Subcomponente isolado para gerenciar a digitação sem perder o foco da tabela
const AcertosInput = ({ subtopicoId, valorInicial, onRefresh }) => {
  const [valor, setValor] = useState(valorInicial ?? 0);

  useEffect(() => {
    setValor(valorInicial ?? 0);
  }, [valorInicial]);

  const handleBlur = async () => {
    if (valor === (valorInicial ?? 0)) return; // Não faz requisição se o valor não mudou
    try {
      await api.patch(`/subtopicos/${subtopicoId}/acertos?valor=${valor}`);
      if (onRefresh) onRefresh(); // Recarrega os dados para atualizar o aproveitamento
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar acertos.");
    }
  };

  return (
    <input
      type="number"
      min="0"
      max="20"
      className="w-16 border border-gray-300 rounded p-1 text-center font-bold text-blue-700 focus:ring-blue-500 shadow-sm"
      value={valor}
      onChange={(e) => {
        let v = parseInt(e.target.value);
        if (isNaN(v)) v = 0;
        if (v < 0) v = 0;
        if (v > 20) v = 20;
        setValor(v);
      }}
      onBlur={handleBlur}
    />
  );
};

export default function TabelaPlanilha({
  detalhes,
  themeColors,
  onOpenSubtopicModal,
  onToggleRevisao,
  getCorTag,
  onRefresh,
}) {
  if (!detalhes || !detalhes.topicos || detalhes.topicos.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500 italic border rounded-lg shadow-sm">
        Nenhum dado cadastrado para esta matéria ainda.
      </div>
    );
  }

  // Função para alternar o Estudo Base direto na linha do subtópico com confirmação
  const handleToggleEstudoBase = async (sub) => {
    if (sub.estudo_base) {
      const confirmou = window.confirm(
        `Tem certeza que deseja desmarcar o Estudo Base de "${sub.nome}"? A data da aula e as revisões agendadas serão apagadas.`
      );
      if (!confirmou) return;
    }

    try {
      await api.patch(`/subtopicos/${sub.id}/toggle-estudo-base`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o estudo base.");
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-[11px] uppercase tracking-wider border-b border-gray-300">
              <th className="p-3 font-bold border-r border-gray-300 w-48">
                Tópico
              </th>
              <th className="p-3 font-bold border-r border-gray-300 w-56">
                Subtópico
              </th>
              <th className="p-3 font-bold border-r border-gray-300 text-center w-28">
                Estudo Base
              </th>
              <th className="p-3 font-bold border-r border-gray-300 text-center w-28">
                Data da Aula
              </th>
              <th className="p-3 font-bold border-r border-gray-300 text-center w-28 text-blue-700 bg-blue-50">
                Rev 1 (24h)
              </th>
              <th className="p-3 font-bold border-r border-gray-300 text-center w-28 text-blue-700 bg-blue-50">
                Rev 2 (7d)
              </th>
              <th className="p-3 font-bold border-r border-gray-300 text-center w-28 text-blue-700 bg-blue-50">
                Rev 3 (30d)
              </th>
              <th className="p-3 font-bold border-r border-gray-300 text-center w-24">
                Acertos
              </th>
              <th className="p-3 font-bold border-r border-gray-300 text-center w-24">
                Aprov.
              </th>
              <th className="p-3 font-bold text-center w-28">Dificuldade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {detalhes.topicos.map((topico, topicoIdx) => {
              const rowSpan =
                topico.subtopicos.length > 0 ? topico.subtopicos.length : 1;
              const bgColor = themeColors[topicoIdx % themeColors.length];

              return (
                <Fragment key={topico.id}>
                  {topico.subtopicos.length === 0 ? (
                    <tr className="border-b border-gray-100">
                      <td
                        className={`p-4 border-r border-gray-200 font-bold text-gray-800 align-top ${bgColor}`}
                      >
                        <div className="flex justify-between flex-col gap-2">
                          <span>{topico.nome}</span>
                          <button
                            onClick={() => onOpenSubtopicModal(topico.id)}
                            className="text-[10px] bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded w-fit hover:bg-gray-100"
                          >
                            + Subtópico
                          </button>
                        </div>
                      </td>
                      <td
                        colSpan="9"
                        className="p-4 text-gray-400 italic bg-white text-center"
                      >
                        Nenhum subtópico cadastrado.
                      </td>
                    </tr>
                  ) : (
                    topico.subtopicos.map((sub, subIdx) => {
                      const aula = sub.aula;
                      const revs = [1, 2, 3].map((num) =>
                        aula
                          ? aula.revisoes.find((r) => r.numero === num)
                          : null
                      );

                      return (
                        <tr
                          key={sub.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          {subIdx === 0 && (
                            <td
                              className={`p-3 border-r border-gray-200 font-bold text-gray-800 align-top ${bgColor}`}
                              rowSpan={rowSpan}
                            >
                              <div className="flex justify-between flex-col h-full gap-2">
                                <span>{topico.nome}</span>
                                <button
                                  onClick={() => onOpenSubtopicModal(topico.id)}
                                  className="text-[10px] bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded w-fit hover:bg-gray-100 mt-2 shadow-sm"
                                >
                                  + Subtópico
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="p-3 border-r border-gray-200 font-medium text-gray-800 bg-white">
                            {sub.nome}{" "}
                            <span className="text-[10px] text-gray-400 ml-1">
                              #{sub.id}
                            </span>
                          </td>

                          {/* ESTUDO BASE */}
                          <td className="p-3 border-r border-gray-200 text-center bg-white align-middle">
                            <button
                              onClick={() => handleToggleEstudoBase(sub)}
                              className={`px-2.5 py-1 rounded text-xs font-bold shadow-sm transition ${
                                sub.estudo_base
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {sub.estudo_base ? "✓ SIM" : "— NÃO"}
                            </button>
                          </td>

                          {/* DATA DA AULA */}
                          <td className="p-3 border-r border-gray-200 text-center bg-white font-medium text-gray-600">
                            {aula ? (
                              new Date(aula.data_aula).toLocaleDateString("pt-BR")
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>

                          {/* COLUNAS DE REVISÃO */}
                          {revs.map((rev, rIdx) => (
                            <td
                              key={rIdx}
                              className="p-3 border-r border-gray-200 text-center bg-white"
                            >
                              {!rev ? (
                                "-"
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className={`text-xs font-medium ${
                                      rev.status === "Concluída"
                                        ? "text-gray-400 line-through"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {new Date(rev.data).toLocaleDateString("pt-BR")}
                                  </span>
                                  <button
                                    onClick={() =>
                                      onToggleRevisao(topicoIdx, subIdx, rIdx + 1)
                                    }
                                    className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider transition ${
                                      rev.status === "Concluída"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-700"
                                    }`}
                                  >
                                    {rev.status === "Concluída" ? "✓ OK" : "Pendente"}
                                  </button>
                                </div>
                              )}
                            </td>
                          ))}

                          {/* COLUNA: ACERTOS */}
                          <td className="p-3 border-r border-gray-200 text-center bg-white align-middle">
                            {sub.estudo_base ? (
                              <AcertosInput
                                subtopicoId={sub.id}
                                valorInicial={sub.acertos}
                                onRefresh={onRefresh}
                              />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>

                          {/* COLUNA: APROVEITAMENTO */}
                          <td className="p-3 border-r border-gray-200 text-center bg-white">
                            {sub.estudo_base ? (
                              <span
                                className={`text-sm font-bold ${
                                  sub.aproveitamento >= 70
                                    ? "text-green-600"
                                    : sub.aproveitamento >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {sub.aproveitamento ?? 0}%
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          
                          {/* COLUNA: DIFICULDADE */}
                          <td className="p-3 text-center bg-white">
                            <span
                              className={`px-2 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider inline-block w-20 shadow-sm ${getCorTag(
                                sub.dificuldade_cor
                              )}`}
                            >
                              {sub.dificuldade_grau}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}