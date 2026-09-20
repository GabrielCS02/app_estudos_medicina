import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import PainelMaterias from './pages/PainelMaterias';
import CronogramaAvaliacoes from './pages/CronogramaAvaliacoes';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  return (
    <div className="App min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Barra de Navegação Superior */}
      <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🩺</span>
            <span className="font-bold text-lg tracking-tight">
              Acompanhamento de Estudos
            </span>
          </div>

          <div className="flex gap-6 font-medium">
            <button 
              onClick={() => setAbaAtiva('dashboard')} 
              className={`hover:text-blue-200 transition ${
                abaAtiva === 'dashboard' ? 'border-b-2 border-white pb-1 font-semibold' : 'text-blue-100'
              }`}
            >
              Visão Geral
            </button>
            
            <button 
              onClick={() => setAbaAtiva('materias')} 
              className={`hover:text-blue-200 transition ${
                abaAtiva === 'materias' ? 'border-b-2 border-white pb-1 font-semibold' : 'text-blue-100'
              }`}
            >
              Planilha de Acompanhamento
            </button>

            <button 
              onClick={() => setAbaAtiva('cronograma')} 
              className={`hover:text-blue-200 transition ${
                abaAtiva === 'cronograma' ? 'border-b-2 border-white pb-1 font-semibold' : 'text-blue-100'
              }`}
            >
              Cronograma de Provas
            </button>
          </div>
        </div>
      </nav>

      {/* Renderização Condicional das Telas */}
      <main className="flex-grow">
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'materias' && <PainelMaterias />}
        {abaAtiva === 'cronograma' && <CronogramaAvaliacoes />}
      </main>
    </div>
  );
}