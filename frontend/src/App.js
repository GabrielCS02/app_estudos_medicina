import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import PainelMaterias from './pages/PainelMaterias';
import CronogramaAvaliacoes from './pages/CronogramaAvaliacoes';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  return (
    <div className="App min-h-screen bg-[#F0F7F7] flex flex-col font-sans text-slate-800">
      
      {/* Menu Flutuante (Estilo Pílula) */}
      <nav className="sticky top-2 sm:top-4 z-40 px-2 sm:px-8 pt-2 pb-4">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-full shadow-[0_10px_40px_-10px_rgba(13,116,108,0.12)] px-3 sm:px-6 h-16 flex items-center justify-between border border-white">
          
          <div className="flex items-center gap-2 sm:gap-3 text-[#0D5C53] font-black text-lg sm:text-xl tracking-tight shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#E5F3F1] rounded-full flex items-center justify-center text-xl sm:text-2xl">
              👩‍⚕️
            </div>
            <span className="hidden sm:block">Medicina aplicada</span>
          </div>

          {/* Botões de Navegação - Sem o Módulo de Revisões */}
          <div className="flex gap-1 sm:gap-3 font-semibold overflow-x-auto scrollbar-hide whitespace-nowrap pl-2 sm:pl-4">
            {[
              { id: 'dashboard', label: 'Visão Geral' },
              { id: 'materias', label: 'Acompanhamento' },
              { id: 'cronograma', label: 'Provas' }
            ].map(aba => (
              <button 
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)} 
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-300 ease-out ${
                  abaAtiva === aba.id 
                    ? 'bg-[#0D8A72] text-white shadow-md shadow-[#0D8A72]/30 scale-105' 
                    : 'text-slate-500 hover:bg-[#E5F3F1] hover:text-[#0D5C53]'
                }`}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Área Principal Limpa */}
      <main className="flex-grow w-full">
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'materias' && <PainelMaterias />}
        {abaAtiva === 'cronograma' && <CronogramaAvaliacoes />}
      </main>
    </div>
  );
}