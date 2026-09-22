import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import PainelMaterias from "./pages/PainelMaterias";
import CronogramaAvaliacoes from "./pages/CronogramaAvaliacoes";

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  return (
    <div className="App min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Barra de Navegação Premium */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 text-blue-600 font-black text-lg tracking-tight">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              ></path>
            </svg>
            MedTracker
          </div>
          <div className="flex gap-2 sm:gap-4 font-medium overflow-x-auto scrollbar-hide whitespace-nowrap pl-4">
            {[
              { id: "dashboard", label: "Visão Geral" },
              { id: "materias", label: "Planilha de Acompanhamento" },
              { id: "cronograma", label: "Cronograma de Provas" },
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                  abaAtiva === aba.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                }`}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Área Principal */}
      <main className="flex-grow w-full">
        {abaAtiva === "dashboard" && <Dashboard />}
        {abaAtiva === "materias" && <PainelMaterias />}
        {abaAtiva === "cronograma" && <CronogramaAvaliacoes />}
      </main>
    </div>
  );
}
