import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/visao-geral")
      .then((res) => setDados(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">A carregar o painel executivo...</div>;
  if (!dados) return <div className="p-12 text-center text-red-500 font-medium">Erro ao carregar os dados.</div>;

  const { aproveitamento_medio_geral, alertas, agenda_dinamica, desempenho_consolidado } = dados;
  const totalRevisoes = agenda_dinamica?.tarefas?.length || 0;
  const revisoesAtrasadas = agenda_dinamica?.tarefas?.filter((t) => t.atrasada).length || 0;
  const totalProvas = alertas?.provas_proximas?.length || 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Visão Geral Consolidada</h1>
          <p className="text-sm text-slate-500 mt-1">O seu progresso de estudos em tempo real.</p>
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          Atualizado: {new Date().toLocaleDateString("pt-PT")}
        </div>
      </div>

      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-100 p-5 shadow-md shadow-slate-200/50 border-t-4 border-t-blue-500 rounded-xl transition hover:-translate-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aproveitamento Geral</p>
          <p className="text-3xl font-black text-slate-800">{aproveitamento_medio_geral}%</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 shadow-md shadow-slate-200/50 border-t-4 border-t-amber-400 rounded-xl transition hover:-translate-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Revisões Pendentes</p>
          <p className="text-3xl font-black text-slate-800">{totalRevisoes}</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 shadow-md shadow-slate-200/50 border-t-4 border-t-red-500 rounded-xl transition hover:-translate-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Revisões Atrasadas</p>
          <p className="text-3xl font-black text-slate-800">{revisoesAtrasadas}</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 shadow-md shadow-slate-200/50 border-t-4 border-t-emerald-500 rounded-xl transition hover:-translate-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Provas Próximas</p>
          <p className="text-3xl font-black text-slate-800">{totalProvas}</p>
        </div>
      </div>

      {/* Tabelas Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Tabela 1: Agenda Dinâmica */}
        <div className="bg-white border border-slate-200 shadow-md shadow-slate-200/50 flex flex-col max-h-[420px] rounded-2xl overflow-hidden">
          <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{agenda_dinamica.titulo}</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">{totalRevisoes}</span>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1 p-2">
            <table className="w-full text-left text-sm border-collapse min-w-[450px]">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr>
                  <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Disciplina</th>
                  <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Subtópico</th>
                  <th className="p-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider w-16">Aprov.</th>
                  <th className="p-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Revisão</th>
                  <th className="p-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agenda_dinamica.tarefas.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Tudo em dia! ✨</td></tr>
                ) : (
                  agenda_dinamica.tarefas.map((tarefa, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-slate-900 text-xs">{tarefa.disciplina}</td>
                      <td className="p-3 text-slate-600 text-xs truncate max-w-[120px] sm:max-w-[150px]">{tarefa.subtopico}</td>
                      <td className="p-3 text-center font-bold text-xs">
                        <span className={tarefa.aproveitamento < 50 ? "text-red-500" : tarefa.aproveitamento < 70 ? "text-amber-500" : "text-emerald-500"}>
                          {tarefa.aproveitamento}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-700 font-medium text-xs">{tarefa.revisao}</td>
                      <td className="p-3 text-center">
                        {tarefa.atrasada 
                          ? <span className="px-2.5 py-1 bg-red-50 text-red-600 font-bold text-[10px] uppercase rounded-md border border-red-100">Atrasada</span> 
                          : <span className="px-2.5 py-1 bg-amber-50 text-amber-600 font-bold text-[10px] uppercase rounded-md border border-amber-100">Hoje</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela 2: Alertas */}
        <div className="bg-white border border-slate-200 shadow-md shadow-slate-200/50 flex flex-col max-h-[420px] rounded-2xl overflow-hidden">
          <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200 p-4 shrink-0">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {alertas.titulo}
            </h2>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1 p-2">
            <table className="w-full text-left text-sm border-collapse min-w-[400px]">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr>
                  <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Disciplina</th>
                  <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Exame</th>
                  <th className="p-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Data</th>
                  <th className="p-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertas.provas_proximas.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium">Agenda livre. 🌴</td></tr>
                ) : (
                  alertas.provas_proximas.map((prova, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-slate-900 text-xs">{prova.disciplina}</td>
                      <td className="p-3 text-slate-600 text-xs">{prova.tipo}</td>
                      <td className="p-3 text-center text-slate-700 font-medium text-xs">{new Date(prova.data).toLocaleDateString("pt-PT")}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 font-bold text-[10px] uppercase rounded-md border ${prova.dias_restantes <= 0 ? "bg-red-500 text-white animate-pulse" : "bg-red-50 text-red-600 border-red-100"}`}>
                          {prova.dias_restantes <= 0 ? "Hoje" : `Faltam ${prova.dias_restantes} d`}
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

      {/* Tabela 3: Barras Condicionais */}
      <div className="bg-white border border-slate-200 shadow-md shadow-slate-200/50 rounded-2xl overflow-hidden p-2">
        <div className="p-4 flex justify-between items-center mb-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Desempenho Consolidado</h2>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          <table className="w-full text-left text-sm border-collapse min-w-[500px]">
            <thead>
              <tr>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider w-1/3 sm:w-1/4">Disciplina</th>
                <th className="p-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider w-20 sm:w-24">Acerto</th>
                <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {desempenho_consolidado.map((item, idx) => {
                let barColor = "bg-gradient-to-r from-emerald-400 to-emerald-500";
                if (item.aproveitamento < 50) barColor = "bg-gradient-to-r from-red-400 to-red-500";
                else if (item.aproveitamento < 70) barColor = "bg-gradient-to-r from-amber-400 to-amber-500";
                
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-900 text-xs sm:text-sm">{item.disciplina}</td>
                    <td className="p-3 text-center font-bold text-slate-700 text-xs sm:text-sm">{item.aproveitamento}%</td>
                    <td className="p-3 align-middle">
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${item.aproveitamento}%` }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}