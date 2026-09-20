import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ModalAvaliacao({ isOpen, onClose, onSave }) {
  const [materias, setMaterias] = useState([]);
  const [materiaId, setMateriaId] = useState('');
  const [tipoAvaliacao, setTipoAvaliacao] = useState('Prova Prática');
  const [data, setData] = useState('');
  const [valor, setValor] = useState(10.0);

  // Estados para os subtópicos dinâmicos
  const [subtopicosDisponiveis, setSubtopicosDisponiveis] = useState([]);
  const [subtopicosSelecionados, setSubtopicosSelecionados] = useState([]);
  const [loadingSubtopicos, setLoadingSubtopicos] = useState(false);

  const tiposDisponiveis = [
    'Seminário',
    'Relatório de Laboratório',
    'OSCE',
    'Prova Prática',
    'Prova Teórica',
    'Estudo de Caso',
    'Trabalho / Artigo',
    'Outro'
  ];

  // 1. Carrega as matérias cadastradas ao abrir a janela
  useEffect(() => {
    if (isOpen) {
      api.get('/materias/')
        .then(res => {
          setMaterias(res.data);
          if (res.data.length > 0) {
            setMateriaId(res.data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // 2. Busca os subtópicos da matéria selecionada sempre que o materiaId mudar
  useEffect(() => {
    if (materiaId) {
      setLoadingSubtopicos(true);
      api.get(`/materias/${materiaId}/detalhes`)
        .then(res => {
          const lista = [];
          (res.data.topicos || []).forEach(topico => {
            (topico.subtopicos || []).forEach(sub => {
              lista.push({
                id: sub.id,
                nome: sub.nome,
                topicoNome: topico.nome
              });
            });
          });
          setSubtopicosDisponiveis(lista);
          setSubtopicosSelecionados([]); // Limpa a seleção anterior ao trocar de matéria
        })
        .catch(console.error)
        .finally(() => setLoadingSubtopicos(false));
    } else {
      setSubtopicosDisponiveis([]);
      setSubtopicosSelecionados([]);
    }
  }, [materiaId]);

  if (!isOpen) return null;

  // Alterna a seleção de um subtópico individual
  const handleToggleSubtopico = (nomeSub) => {
    setSubtopicosSelecionados(prev =>
      prev.includes(nomeSub)
        ? prev.filter(item => item !== nomeSub)
        : [...prev, nomeSub]
    );
  };

  // Selecionar ou desselecionar todos os subtópicos visíveis
  const handleSelectAll = () => {
    if (subtopicosSelecionados.length === subtopicosDisponiveis.length) {
      setSubtopicosSelecionados([]);
    } else {
      setSubtopicosSelecionados(subtopicosDisponiveis.map(s => s.nome));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!materiaId) {
      alert("Selecione uma matéria válida.");
      return;
    }

    if (subtopicosSelecionados.length === 0) {
      alert("Selecione ao menos 1 subtópico para o Conteúdo Cobrado.");
      return;
    }

    // Une os subtópicos marcados separados por vírgula
    const conteudoFormatado = subtopicosSelecionados.join(", ");

    onSave({
      materia_id: parseInt(materiaId),
      tipo_avaliacao: tipoAvaliacao,
      conteudo_cobrado: conteudoFormatado,
      data: data,
      valor: parseFloat(valor)
    });

    setSubtopicosSelecionados([]);
    setData('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
          Cadastrar Nova Avaliação
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DISCIPLINA / MATÉRIA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina / Matéria
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              required
            >
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
              {materias.length === 0 && (
                <option value="">Nenhuma matéria cadastrada</option>
              )}
            </select>
          </div>

          {/* TIPO DE AVALIAÇÃO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Avaliação
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={tipoAvaliacao}
              onChange={(e) => setTipoAvaliacao(e.target.value)}
            >
              {tiposDisponiveis.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* CONTEÚDO COBRADO (SELEÇÃO DE SUBTÓPICOS) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Conteúdo Cobrado ({subtopicosSelecionados.length} selecionado{subtopicosSelecionados.length === 1 ? '' : 's'})
              </label>
              {subtopicosDisponiveis.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {subtopicosSelecionados.length === subtopicosDisponiveis.length
                    ? 'Desmarcar todos'
                    : 'Marcar todos'}
                </button>
              )}
            </div>

            <div className="border border-gray-300 rounded-md p-2 bg-gray-50 max-h-44 overflow-y-auto space-y-1">
              {loadingSubtopicos ? (
                <p className="text-xs text-gray-500 text-center py-4">Buscando subtópicos...</p>
              ) : subtopicosDisponiveis.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 italic">
                  Esta matéria ainda não possui subtópicos cadastrados na planilha.
                </p>
              ) : (
                subtopicosDisponiveis.map(sub => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer transition border border-transparent hover:border-gray-200"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={subtopicosSelecionados.includes(sub.nome)}
                      onChange={() => handleToggleSubtopico(sub.nome)}
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800">{sub.nome}</span>
                      <span className="text-gray-400 ml-1.5 font-normal">({sub.topicoNome})</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* DATA DA PROVA E VALOR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Prova
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (Nota Máx.)
              </label>
              <input
                type="number"
                step="0.5"
                className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
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
              Salvar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}