import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TabelaPlanilha from '../components/TabelaPlanilha';
import ModalTopico from '../components/ModalTopico';
import ModalSubtopico from '../components/ModalSubtopico';
import ModalMateria from '../components/ModalMateria';

export default function PainelMaterias() {
  const [materiasComDetalhes, setMateriasComDetalhes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const [isMateriaModalOpen, setMateriaModalOpen] = useState(false);
  const [isTopicModalOpen, setTopicModalOpen] = useState(false);
  const [isSubtopicModalOpen, setSubtopicModalOpen] = useState(false);
  
  const [activeMateriaId, setActiveMateriaId] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);

  const themeColors = ['bg-sky-50', 'bg-emerald-50', 'bg-fuchsia-50', 'bg-amber-50', 'bg-indigo-50', 'bg-rose-50', 'bg-teal-50', 'bg-violet-50'];

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await api.get('/materias/');
      const lista = res.data;
      const promessas = lista.map(m => api.get(`/materias/${m.id}/detalhes`).then(r => r.data));
      const resultados = await Promise.all(promessas);
      setMateriasComDetalhes(resultados);

      setExpanded(prev => {
        const expInit = { ...prev };
        resultados.forEach(m => { if (expInit[m.id] === undefined) expInit[m.id] = true; });
        return expInit;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const toggleExpand = (materiaId) => setExpanded(prev => ({ ...prev, [materiaId]: !prev[materiaId] }));

  const handleSaveMateria = async (nomeMateria, nomeTopico, estudoBase) => {
    try {
      const resMat = await api.post(`/materias/?nome=${encodeURIComponent(nomeMateria)}`);
      await api.post(`/materias/${resMat.data.materia_id}/topicos/?nome=${encodeURIComponent(nomeTopico)}&estudo_base=${estudoBase}`);
      setMateriaModalOpen(false);
      carregarDados();
    } catch (error) { alert("Erro ao cadastrar."); }
  };

  const handleSaveTopic = async (nome, estudoBase) => {
    try {
      await api.post(`/materias/${activeMateriaId}/topicos/?nome=${encodeURIComponent(nome)}&estudo_base=${estudoBase}`);
      setTopicModalOpen(false);
      carregarDados();
    } catch (error) { alert("Erro ao criar tópico."); }
  };

  const handleSaveSubtopic = async (nome, dificuldade) => {
    try {
      await api.post(`/topicos/${activeTopicId}/subtopicos/?nome=${encodeURIComponent(nome)}&dificuldade=${dificuldade}`);
      setSubtopicModalOpen(false);
      carregarDados();
    } catch (error) { alert("Erro ao criar subtópico."); }
  };

  const toggleStatusRevisao = (materiaId, topicoIdx, subIdx, revNumero) => {
    const novas = [...materiasComDetalhes];
    const mat = novas.find(m => m.id === materiaId);
    if (mat) {
      const revisoes = mat.topicos[topicoIdx].subtopicos[subIdx].aula.revisoes;
      const revIndex = revisoes.findIndex(r => r.numero === revNumero);
      if (revIndex !== -1) {
        revisoes[revIndex].status = revisoes[revIndex].status === 'Pendente' ? 'Concluída' : 'Pendente';
        setMateriasComDetalhes(novas);
      }
    }
  };

  const getCorTag = (corEnum) => {
    switch (corEnum) {
      case "Verde": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Amarelo": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Vermelho": return "bg-red-50 text-red-700 border border-red-200";
      default: return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">A carregar matérias...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-[98%] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Planilha de Acompanhamento</h1>
        <button 
          onClick={() => setMateriaModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full shadow-md shadow-blue-200 transition-all flex items-center gap-2"
        >
          + Cadastrar Matéria
        </button>
      </div>

      {materiasComDetalhes.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 font-medium border border-slate-200 rounded-2xl shadow-sm">
          Nenhuma matéria cadastrada. Clique no botão acima para começar.
        </div>
      ) : (
        materiasComDetalhes.map((detalhes) => (
          <div key={detalhes.id} className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 overflow-hidden mb-8 transition-all">
            {/* Cabeçalho Limpo (Estilo Apple) */}
            <div 
              onClick={() => toggleExpand(detalhes.id)}
              className="bg-white p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition select-none border-l-4 border-blue-500"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-extrabold text-slate-800 uppercase tracking-widest">{detalhes.nome}</span>
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">{detalhes.topicos.length} Tópicos</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMateriaId(detalhes.id); setTopicModalOpen(true); }}
                  className="bg-slate-100 hover:bg-slate-200 text-blue-600 text-xs font-bold py-1.5 px-4 rounded-full transition"
                >
                  + Novo Tópico
                </button>
                <span className="text-slate-400 font-bold bg-slate-50 w-8 h-8 flex items-center justify-center rounded-full">
                  {expanded[detalhes.id] ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {expanded[detalhes.id] && (
              <div className="border-t border-slate-100 p-2">
                <TabelaPlanilha 
                  detalhes={detalhes} 
                  themeColors={themeColors} 
                  onOpenSubtopicModal={(topicoId) => { setActiveTopicId(topicoId); setSubtopicModalOpen(true); }} 
                  onToggleRevisao={(topIdx, subIdx, revNum) => toggleStatusRevisao(detalhes.id, topIdx, subIdx, revNum)} 
                  getCorTag={getCorTag} 
                  ocultarCabecalhoMateria={true} 
                />
              </div>
            )}
          </div>
        ))
      )}

      {/* Os modais estão nos seus ficheiros. Adicione a classe 'backdrop-blur-sm' neles! */}
      <ModalMateria isOpen={isMateriaModalOpen} onClose={() => setMateriaModalOpen(false)} onSave={handleSaveMateria} />
      <ModalTopico isOpen={isTopicModalOpen} onClose={() => setTopicModalOpen(false)} onSave={handleSaveTopic} />
      <ModalSubtopico isOpen={isSubtopicModalOpen} onClose={() => setSubtopicModalOpen(false)} onSave={handleSaveSubtopic} />
    </div>
  );
}