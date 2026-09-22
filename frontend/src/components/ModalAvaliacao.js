import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalAvaliacao({ isOpen, onClose, onSave, disciplinasAtivas = [] }) {
  const [disciplina, setDisciplina] = useState('');
  const [tipo, setTipo] = useState('Prova Prática');
  const [conteudo, setConteudo] = useState('');
  const [dataProva, setDataProva] = useState('');
  const [valor, setValor] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      disciplina,
      tipo_avaliacao: tipo,
      conteudo_cobrado: conteudo,
      data: dataProva,
      valor: parseFloat(valor),
      status: "Pendente"
    });
    // Resetar campos
    setDisciplina('');
    setConteudo('');
    setDataProva('');
    setValor(10);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
      
      {/* Overlay com Desfoque */}
      <div 
        className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Caixa do Pop-up */}
      <div className="relative bg-white p-6 sm:p-8 rounded-[2rem] w-[90%] max-w-lg shadow-[0_20px_60px_-15px_rgba(13,116,108,0.2)] animate-fade-in max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D5C53] mb-6 tracking-tight">
          Cadastrar Nova Avaliação
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Disciplina e Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Disciplina / Matéria
              </label>
              <input 
                type="text"
                className="w-full bg-[#F8FBFB] border border-[#D0EBE7] hover:border-[#0D8A72] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all shadow-inner"
                placeholder="Ex: Anatomia"
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tipo de Avaliação
              </label>
              <select 
                className="w-full bg-[#F8FBFB] border border-[#D0EBE7] hover:border-[#0D8A72] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all shadow-inner cursor-pointer"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="Prova Prática">Prova Prática</option>
                <option value="Prova Teórica">Prova Teórica</option>
                <option value="Seminário">Seminário</option>
                <option value="Trabalho / Artigo">Trabalho / Artigo</option>
                <option value="OSCE">OSCE</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Conteúdo Cobrado (Adaptado para Input de Texto Multilinhas limpo) */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Conteúdo Cobrado
              </label>
            </div>
            <textarea 
              rows="3"
              className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] focus:border-[#0D8A72] outline-none transition-all shadow-inner placeholder-slate-300 resize-none" 
              placeholder="Descreva os tópicos ou cole a lista de conteúdos..." 
              value={conteudo} 
              onChange={(e) => setConteudo(e.target.value)} 
              required 
            />
          </div>

          {/* Data e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Data da Prova
              </label>
              <input 
                type="date" 
                className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all shadow-inner cursor-pointer" 
                value={dataProva} 
                onChange={(e) => setDataProva(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Valor (Nota Máx.)
              </label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                className="w-full bg-[#F8FBFB] border border-[#D0EBE7] rounded-xl p-3 text-sm font-medium text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all shadow-inner" 
                value={valor} 
                onChange={(e) => setValor(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
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
              Salvar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}