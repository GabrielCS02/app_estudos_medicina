import React, { useState } from 'react';

export default function ModalMateria({ isOpen, onClose, onSave }) {
  const [nomeMateria, setNomeMateria] = useState('');
  const [nomeTopico, setNomeTopico] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Passa apenas o nome da matéria e do tópico inicial (estudo base fica para o subtópico)
    onSave(nomeMateria, nomeTopico);
    setNomeMateria('');
    setNomeTopico('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Cadastrar Nova Matéria</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Matéria</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Ex: Cardiologia" 
              value={nomeMateria} 
              onChange={(e) => setNomeMateria(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tópico Inicial</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Ex: Insuficiência Cardíaca" 
              value={nomeTopico} 
              onChange={(e) => setNomeTopico(e.target.value)} 
              required 
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
            >
              Salvar Matéria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}