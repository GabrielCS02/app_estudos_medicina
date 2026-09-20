import React, { useState } from 'react';

export default function ModalTopico({ isOpen, onClose, onSave }) {
  const [nome, setNome] = useState('');
  const [estudoBase, setEstudoBase] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(nome, estudoBase);
    setNome('');
    setEstudoBase(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <h3 className="text-lg font-bold mb-4">Adicionar Novo Tópico</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Tópico</label>
            <input type="text" className="w-full border p-2 rounded" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="mb-6 flex items-center gap-2">
            <input type="checkbox" checked={estudoBase} onChange={(e) => setEstudoBase(e.target.checked)} />
            <label className="text-sm font-medium text-gray-700">Realizou Estudo Base?</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}