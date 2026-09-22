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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F7F7]">
        <div className="w-12 h-12 border-4 border-[#D0EBE7] border-t-[#0D8A72] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#0D8A72] font-medium animate-pulse">Preparando o seu ambiente...</p>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F7F7]">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center">
          <p className="text-rose-500 font-bold text-lg">Erro ao carregar os dados.</p>
          <p className="text-slate-500 text-sm mt-2">Verifique a sua conexão com o servidor.</p>
        </div>
      </div>
    );
  }

  const {
    aproveitamento_medio_geral,
    alertas,
    agenda_dinamica,
    desempenho_consolidado,
  } = dados;

  const totalRevisoes = agenda_dinamica?.tarefas?.length || 0;
  const revisoesAtrasadas = agenda_dinamica?.tarefas?.filter((t) => t.atrasada).length || 0;
  const totalProvas = alertas?.provas_proximas?.length || 0;

  return (
    // Fundo verde-azulado ultra claro, igual ao da imagem de referência
    <div className="p-4 sm:p-8 min-h-screen bg-[#F0F7F7] font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho no estilo "Hello, Sarah" */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-600 flex items-center gap-2">
              Olá, Estudante <span className="text-2xl">👋</span>
            </h1>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0D5C53] mt-1 tracking-tight">
              Como estão os seus estudos hoje?
            </p>
          </div>
          <div className="bg-white text-[#0D8A72] px-4 py-2 rounded-full font-semibold text-sm shadow-[0_8px_30px_rgb(13,138,114,0.08)] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {new Date().toLocaleDateString("pt-PT")}
          </div>
        </div>

        {/* KPIs estilo "Categories / Top Doctors" (Cartões flutuantes brancos, arredondados) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Aproveitamento */}
          <div className="bg-white p-5 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.1)] flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-[#E5F3F1] flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-[#0D8A72]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Aproveitamento</p>
              <p className="text-2xl font-black text-[#0D5C53]">{aproveitamento_medio_geral}%</p>
            </div>
          </div>

          {/* Revisões Pendentes */}
          <div className="bg-white p-5 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.1)] flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pendentes</p>
              <p className="text-2xl font-black text-[#0D5C53]">{totalRevisoes}</p>
            </div>
          </div>

          {/* Revisões Atrasadas */}
          <div className="bg-white p-5 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.1)] flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Atrasadas</p>
              <p className="text-2xl font-black text-[#0D5C53]">{revisoesAtrasadas}</p>
            </div>
          </div>

          {/* Provas Próximas */}
          <div className="bg-white p-5 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.1)] flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Exames</p>
              <p className="text-2xl font-black text-[#0D5C53]">{totalProvas}</p>
            </div>
          </div>
        </div>

        {/* Paineis de Listagem Brancos Ultra Arredondados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Agenda Dinâmica */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.08)] flex flex-col overflow-hidden max-h-[420px]">
            <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-[#0D5C53]">{agenda_dinamica.titulo}</h2>
              <span className="text-xs bg-[#E5F3F1] text-[#0D8A72] px-3 py-1 rounded-full font-bold">
                {totalRevisoes} Itens
              </span>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto flex-1 p-2">
              <table className="w-full text-left border-collapse min-w-[450px]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Disciplina</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Subtópico</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider w-16">Aprov.</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Revisão</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {agenda_dinamica.tarefas.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Tudo em dia! ✨</td></tr>
                  ) : (
                    agenda_dinamica.tarefas.map((tarefa, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 text-sm">{tarefa.disciplina}</td>
                        <td className="px-4 py-3 text-slate-500 text-sm truncate max-w-[120px] sm:max-w-[150px]">{tarefa.subtopico}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-sm ${tarefa.aproveitamento < 50 ? "text-rose-500" : tarefa.aproveitamento < 70 ? "text-amber-500" : "text-[#0D8A72]"}`}>
                            {tarefa.aproveitamento}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 font-medium text-sm">{tarefa.revisao}</td>
                        <td className="px-4 py-3 text-center">
                          {tarefa.atrasada 
                            ? <span className="px-3 py-1 bg-rose-50 text-rose-600 font-bold text-[10px] uppercase tracking-wider rounded-full">Atrasada</span> 
                            : <span className="px-3 py-1 bg-amber-50 text-amber-600 font-bold text-[10px] uppercase tracking-wider rounded-full">Hoje</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.08)] flex flex-col overflow-hidden max-h-[420px]">
            <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-100 shrink-0">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
              </div>
              <h2 className="text-base font-bold text-[#0D5C53]">{alertas.titulo}</h2>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto flex-1 p-2">
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Disciplina</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Exame</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider">Prazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {alertas.provas_proximas.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium">Agenda livre. 🌴</td></tr>
                  ) : (
                    alertas.provas_proximas.map((prova, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 text-sm">{prova.disciplina}</td>
                        <td className="px-4 py-3 text-slate-500 text-sm">{prova.tipo}</td>
                        <td className="px-4 py-3 text-center text-slate-600 font-medium text-sm">{new Date(prova.data).toLocaleDateString("pt-PT")}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full ${prova.dias_restantes <= 0 ? "bg-rose-500 text-white animate-pulse" : "bg-slate-50 text-slate-600"}`}>
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

        {/* Desempenho Consolidado */}
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.08)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#E5F3F1] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0D8A72]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
             </div>
             <h2 className="text-base font-bold text-[#0D5C53]">Desempenho Consolidado</h2>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr>
                  <th className="px-4 py-2 font-semibold text-slate-400 text-xs uppercase tracking-wider w-1/3 sm:w-1/4">Disciplina</th>
                  <th className="px-4 py-2 font-semibold text-slate-400 text-center text-xs uppercase tracking-wider w-20 sm:w-24">Acerto</th>
                  <th className="px-4 py-2 font-semibold text-slate-400 text-xs uppercase tracking-wider">Evolução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {desempenho_consolidado.map((item, idx) => {
                  let barColor = "from-[#2ED1A2] to-[#0D8A72]"; // Verde-azulado padrão
                  if (item.aproveitamento < 50) barColor = "from-rose-400 to-rose-500";
                  else if (item.aproveitamento < 70) barColor = "from-amber-400 to-amber-500";
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-800 text-sm">{item.disciplina}</td>
                      <td className="px-4 py-4 text-center font-bold text-[#0D5C53] text-sm">{item.aproveitamento}%</td>
                      <td className="px-4 py-4 align-middle">
                        <div className="w-full h-2.5 bg-[#F0F7F7] rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.aproveitamento}%` }}></div>
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
    </div>
  );
}