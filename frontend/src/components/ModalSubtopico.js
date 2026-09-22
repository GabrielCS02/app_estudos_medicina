import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalSubtopico({ isOpen, onClose, onSave }) {
  const [nome, setNome] = useState('');
  const [dificuldade, setDificuldade] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(nome, parseInt(dificuldade));
    setNome('');
    setDificuldade(5);
  };

  const getDificuldadeColor = (val) => {
    if (val <= 3) return "text-[#0D8A72] bg-[#E5F3F1] border-[#0D8A72]";
    if (val <= 7) return "text-amber-600 bg-amber-50 border-amber-500";
    return "text-rose-600 bg-rose-50 border-rose-500";
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
      
      <div 
        className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white p-6 sm:p-8 rounded-[2rem] w-[90%] max-w-md shadow-[0_20px_60px_-15px_rgba(13,116,108,0.2)] animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D5C53] mb-6 tracking-tight">
          Adicionar Subtópico
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Nome do Subtópico
            </label>
            <input 
              type="text" 
              className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] focus:border-[#0D8A72] outline-none transition-all shadow-inner placeholder-slate-300" 
              placeholder="Ex: Ritmos Sinusais" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Grau de Dificuldade
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDificuldadeColor(dificuldade)}`}>
                Nível {dificuldade}
              </span>
            </div>
            <input 
              type="range" 
              min="0" max="10" 
              className="w-full h-2 bg-[#D0EBE7] rounded-lg appearance-none cursor-pointer accent-[#0D8A72]" 
              value={dificuldade} 
              onChange={(e) => setDificuldade(e.target.value)} 
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
              <span>Fácil (0)</span>
              <span>Médio (5)</span>
              <span>Difícil (10)</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-sm font-bold bg-[#0D8A72] text-white rounded-full hover:bg-[#0D5C53] shadow-[0_8px_30px_rgb(13,138,114,0.2)] transition-all transform hover:-translate-y-0.5"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}