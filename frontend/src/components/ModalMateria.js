import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalMateria({ isOpen, onClose, onSave }) {
  const [nomeMateria, setNomeMateria] = useState('');
  const [nomeTopico, setNomeTopico] = useState('');
  
  // NOVO: Estado que controla o bloqueio de carregamento
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Bloqueia a interface e avisa que está a processar
    setIsSubmitting(true); 
    
    try {
      // Aguarda a resposta do servidor
      await onSave(nomeMateria, nomeTopico, false);
      setNomeMateria('');
      setNomeTopico('');
    } finally {
      // 2. Liberta a interface (ocorre automaticamente se der erro ou antes de fechar)
      setIsSubmitting(false); 
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
      
      {/* Overlay com Desfoque (impede de fechar se estiver a guardar) */}
      <div 
        className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      ></div>

      {/* Caixa do Pop-up */}
      <div className="relative bg-white p-6 sm:p-8 rounded-[2rem] w-[90%] max-w-md shadow-[0_20px_60px_-15px_rgba(13,116,108,0.2)] animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D5C53] mb-6 tracking-tight">
          Cadastrar Nova Matéria
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Nome da Matéria
            </label>
            <input 
              type="text" 
              disabled={isSubmitting}
              className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] focus:border-[#0D8A72] outline-none transition-all shadow-inner placeholder-slate-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              placeholder="Ex: Cardiologia" 
              value={nomeMateria} 
              onChange={(e) => setNomeMateria(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tópico Inicial
            </label>
            <input 
              type="text" 
              disabled={isSubmitting}
              className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] focus:border-[#0D8A72] outline-none transition-all shadow-inner placeholder-slate-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              placeholder="Ex: Insuficiência Cardíaca" 
              value={nomeTopico} 
              onChange={(e) => setNomeTopico(e.target.value)} 
              required 
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-full transition-all transform ${
                isSubmitting 
                  ? 'bg-slate-400 cursor-wait shadow-none scale-100' 
                  : 'bg-[#0D8A72] hover:bg-[#0D5C53] shadow-[0_8px_30px_rgb(13,138,114,0.2)] hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? 'A guardar...' : 'Salvar Matéria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}