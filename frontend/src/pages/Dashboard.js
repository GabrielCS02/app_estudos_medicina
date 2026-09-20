import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/visao-geral")
      .then((res) => setDados(res.data))
      .catch((err) => console.error("Erro ao carregar o dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        A carregar painel executivo...
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Erro ao carregar os dados.
      </div>
    );
  }

  const {
    aproveitamento_medio_geral,
    alertas,
    agenda_dinamica,
    desempenho_consolidado,
  } = dados;

  // Agregação rápida para os KPIs superiores
  const totalRevisoes = agenda_dinamica?.tarefas?.length || 0;
  const revisoesAtrasadas =
    agenda_dinamica?.tarefas?.filter((t) => t.atrasada).length || 0;
  const totalProvas = alertas?.provas_proximas?.length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen font-sans">
      {/* Cabeçalho */}
      <div className="flex justify-between items-end border-b border-slate-300 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Visão Geral Consolidada
          </h1>
          <p className="text-sm text-slate-500">
            Dashboard de Acompanhamento de Estudos
          </p>
        </div>
        <div className="text-xs font-medium text-slate-400">
          Atualizado: {new Date().toLocaleDateString("pt-PT")}
        </div>
      </div>

      {/* KPIs Superiores (Estilo Resumo Excel) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-300 p-4 shadow-sm border-l-4 border-l-blue-600">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Aproveitamento Geral
          </p>
          <p className="text-2xl font-black text-slate-800">
            {aproveitamento_medio_geral}%
          </p>
        </div>
        <div className="bg-white border border-slate-300 p-4 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Revisões Pendentes
          </p>
          <p className="text-2xl font-black text-slate-800">{totalRevisoes}</p>
        </div>
        <div className="bg-white border border-slate-300 p-4 shadow-sm border-l-4 border-l-red-600">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Revisões Atrasadas
          </p>
          <p className="text-2xl font-black text-slate-800">
            {revisoesAtrasadas}
          </p>
        </div>
        <div className="bg-white border border-slate-300 p-4 shadow-sm border-l-4 border-l-emerald-600">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Provas Próximas
          </p>
          <p className="text-2xl font-black text-slate-800">{totalProvas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Tabela 1: Agenda Dinâmica (Com Rolagem Interna e Cabeçalho Fixo) */}
        <div className="bg-white border border-slate-300 shadow-sm flex flex-col max-h-[380px]">
          <div className="bg-slate-100 border-b border-slate-300 p-3 flex justify-between items-center shrink-0">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {agenda_dinamica.titulo}
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {totalRevisoes}
            </span>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="p-2 font-semibold text-slate-600 border-r border-slate-200">
                    Disciplina
                  </th>
                  <th className="p-2 font-semibold text-slate-600 border-r border-slate-200">
                    Subtópico
                  </th>
                  <th className="p-2 font-semibold text-slate-600 border-r border-slate-200 text-center w-20">
                    Aprov.
                  </th>
                  <th className="p-2 font-semibold text-slate-600 border-r border-slate-200 text-center">
                    Fase
                  </th>
                  <th className="p-2 font-semibold text-slate-600 text-center">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {agenda_dinamica.tarefas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4 text-center text-slate-400 italic"
                    >
                      Nenhuma revisão pendente para hoje.
                    </td>
                  </tr>
                ) : (
                  agenda_dinamica.tarefas.map((tarefa, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-medium text-slate-800">
                        {tarefa.disciplina}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-600 truncate max-w-[150px]">
                        {tarefa.subtopico}
                      </td>

                      {/* Aproveitamento destacando a prioridade */}
                      <td className="p-2 border-r border-slate-200 text-center font-bold">
                        <span
                          className={
                            tarefa.aproveitamento < 50
                              ? "text-red-600"
                              : tarefa.aproveitamento < 70
                              ? "text-amber-500"
                              : "text-emerald-600"
                          }
                        >
                          {tarefa.aproveitamento}%
                        </span>
                      </td>

                      <td className="p-2 border-r border-slate-200 text-center text-slate-700">
                        {tarefa.revisao}
                      </td>
                      <td className="p-2 text-center">
                        {tarefa.atrasada ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                            Atrasada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                            Hoje
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela 2: Alertas de Avaliações (Com Rolagem Interna e Cabeçalho Fixo) */}
        <div className="bg-white border border-slate-300 shadow-sm flex flex-col max-h-[380px]">
          <div className="bg-slate-100 border-b border-slate-300 p-3 shrink-0">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="text-red-600">■</span> {alertas.titulo}
            </h2>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="p-2 font-semibold text-slate-600 border-r border-slate-200">
                    Disciplina
                  </th>
                  <th className="p-2 font-semibold text-slate-600 border-r border-slate-200">
                    Exame
                  </th>
                  <th className="p-2 font-semibold text-slate-600 border-r border-slate-200 text-center">
                    Data
                  </th>
                  <th className="p-2 font-semibold text-slate-600 text-center">
                    Prazo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {alertas.provas_proximas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-4 text-center text-slate-400 italic"
                    >
                      Agenda de exames livre para os próximos 7 dias.
                    </td>
                  </tr>
                ) : (
                  alertas.provas_proximas.map((prova, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-medium text-slate-800">
                        {prova.disciplina}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-600">
                        {prova.tipo}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-700">
                        {new Date(prova.data).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded border ${
                            prova.dias_restantes <= 0
                              ? "bg-red-600 text-white animate-pulse"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {prova.dias_restantes <= 0
                            ? "Hoje"
                            : `Faltam ${prova.dias_restantes} dias`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabela 3: Formatação Condicional (Barras de Dados) */}
      <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-slate-100 border-b border-slate-300 p-3 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Desempenho Consolidado por Disciplina
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-2 font-semibold text-slate-600 border-r border-slate-200 w-1/4">
                  Disciplina
                </th>
                <th className="p-2 font-semibold text-slate-600 border-r border-slate-200 text-center w-24">
                  Taxa Acerto
                </th>
                <th className="p-2 font-semibold text-slate-600">
                  Gráfico de Desempenho (Data Bar)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {desempenho_consolidado.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="p-4 text-center text-slate-400 italic"
                  >
                    Sem métricas registadas.
                  </td>
                </tr>
              ) : (
                desempenho_consolidado.map((item, idx) => {
                  let barColor = "bg-emerald-500";
                  if (item.aproveitamento < 50) barColor = "bg-red-500";
                  else if (item.aproveitamento < 70) barColor = "bg-amber-500";

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-medium text-slate-800">
                        {item.disciplina}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">
                        {item.aproveitamento}%
                      </td>
                      <td className="p-2 align-middle">
                        <div className="w-full h-4 bg-slate-100 border border-slate-200 relative">
                          <div
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${item.aproveitamento}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}