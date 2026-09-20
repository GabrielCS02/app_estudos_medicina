import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import PainelMaterias from './pages/PainelMaterias';
import ModuloRevisoes from './pages/ModuloRevisoes';
import CronogramaAvaliacoes from './pages/CronogramaAvaliacoes';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  return (
    <div className="App min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-blue-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-6 font-medium">
          <button 
            onClick={() => setAbaAtiva('dashboard')} 
            className={`hover:text-blue-200 transition ${abaAtiva === 'dashboard' ? 'border-b-2 border-white pb-1' : ''}`}
          >
            Visão Geral
          </button>
          
          <button 
            onClick={() => setAbaAtiva('materias')} 
            className={`hover:text-blue-200 transition ${abaAtiva === 'materias' ? 'border-b-2 border-white pb-1' : ''}`}
          >
            Minhas Matérias
          </button>

          <button 
            onClick={() => setAbaAtiva('revisoes')} 
            className={`hover:text-blue-200 transition ${abaAtiva === 'revisoes' ? 'border-b-2 border-white pb-1' : ''}`}
          >
            Registrar Revisão
          </button>

          <button 
            onClick={() => setAbaAtiva('cronograma')} 
            className={`hover:text-blue-200 transition ${abaAtiva === 'cronograma' ? 'border-b-2 border-white pb-1' : ''}`}
          >
            Cronograma de Provas
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'materias' && <PainelMaterias />}
        {abaAtiva === 'revisoes' && <ModuloRevisoes />}
        {abaAtiva === 'cronograma' && <CronogramaAvaliacoes />}
      </main>
    </div>
  );
}