import React, { useState } from 'react';

export default function ModalMateria({ isOpen, onClose, onSave }) {
  const [nomeMateria, setNomeMateria] = useState('');
  const [nomeTopico, setNomeTopico] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(nomeMateria, nomeTopico, true);
    setNomeMateria('');
    setNomeTopico('');
  };

  return (
    // Container Mestre: Fixo na tela inteira com z-index máximo
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center">
      
      {/* Overlay: Fundo Escuro com Desfoque */}
      <div 
        className="absolute inset-0 w-full h-full bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Caixa do Modal */}
      <div className="relative bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-2xl border border-slate-100">
        <h3 className="text-xl font-extrabold text-slate-800 mb-5 tracking-tight">Cadastrar Nova Matéria</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Matéria</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-800 font-medium" 
              placeholder="Ex: Cardiologia"
              value={nomeMateria} 
              onChange={(e) => setNomeMateria(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tópico Inicial</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-800 font-medium" 
              placeholder="Ex: Insuficiência Cardíaca"
              value={nomeTopico} 
              onChange={(e) => setNomeTopico(e.target.value)} 
              required 
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
            >
              Salvar Matéria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}