import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import PainelMaterias from './pages/PainelMaterias';
import CronogramaAvaliacoes from './pages/CronogramaAvaliacoes';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  return (
    <div className="App min-h-screen bg-[#F0F7F7] flex flex-col font-sans text-slate-800">
      
      {/* Menu Flutuante Fixado no Topo com Escudo de Gradiente */}
      <nav className="fixed top-0 left-0 w-full z-50 px-2 sm:px-8 pt-3 sm:pt-4 pb-4 bg-gradient-to-b from-[#F0F7F7] via-[#F0F7F7]/95 to-transparent pointer-events-none">
        
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_40px_-10px_rgba(13,116,108,0.12)] px-3 sm:px-6 h-16 flex items-center justify-between border border-white pointer-events-auto">
          
          {/* Logo / Ícone */}
          <div className="flex items-center gap-2 sm:gap-3 text-[#0D5C53] font-black text-lg sm:text-xl tracking-tight shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#E5F3F1] rounded-full flex items-center justify-center text-xl sm:text-2xl">
              👩‍⚕️
            </div>
            <span className="hidden sm:block">Medicina aplicada</span>
          </div>

          {/* Botões de Navegação */}
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

      {/* Área Principal empurrada para baixo (pt-28) para não ficar sob o menu */}
      <main className="flex-grow w-full pt-28 sm:pt-32">
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'materias' && <PainelMaterias />}
        {abaAtiva === 'cronograma' && <CronogramaAvaliacoes />}
      </main>
    </div>
  );
}