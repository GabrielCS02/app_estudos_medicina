import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../services/api';

export default function Dashboard() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    // Busca os dados da rota /dashboard/visao-geral do FastAPI
    getDashboardData().then(data => setDados(data)).catch(console.error);
  }, []);

  if (!dados) return <div className="p-8 text-center">Carregando painel...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>

      {/* KPI Principal */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Aproveitamento Médio Geral</h2>
        <span className="text-3xl font-bold text-blue-600">{dados.aproveitamento_medio_geral}%</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alertas de Avaliações */}
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
          <h2 className="text-lg font-bold text-red-700 mb-4">{dados.alertas.titulo}</h2>
          <ul className="space-y-2">
            {dados.alertas.provas_proximas.map((prova, idx) => (
              <li key={idx} className="text-red-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {prova}
              </li>
            ))}
          </ul>
        </div>

        {/* Agenda Dinâmica (Revisões do Dia) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{dados.agenda_dinamica.titulo}</h2>
          <ul className="space-y-3">
            {dados.agenda_dinamica.tarefas.map((tarefa, idx) => (
              <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                <span className="text-gray-700">{tarefa}</span>
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                  Concluir
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desempenho Consolidado */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Desempenho Consolidado por Disciplina</h2>
        <div className="space-y-4">
          {dados.desempenho_consolidado.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{item.disciplina}</span>
                <span className="text-gray-500">{item.aproveitamento}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${item.aproveitamento}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}