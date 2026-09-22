import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalMateria({ isOpen, onClose, onSave }) {
  const [nomeMateria, setNomeMateria] = useState('');
  const [nomeTopico, setNomeTopico] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(nomeMateria, nomeTopico, false);
    setNomeMateria('');
    setNomeTopico('');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
      
      {/* Overlay com Desfoque */}
      <div 
        className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
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
              className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] focus:border-[#0D8A72] outline-none transition-all shadow-inner placeholder-slate-300" 
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
              className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] focus:border-[#0D8A72] outline-none transition-all shadow-inner placeholder-slate-300" 
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
              className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-sm font-bold bg-[#0D8A72] text-white rounded-full hover:bg-[#0D5C53] shadow-[0_8px_30px_rgb(13,138,114,0.2)] transition-all transform hover:-translate-y-0.5"
            >
              Salvar Matéria
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}