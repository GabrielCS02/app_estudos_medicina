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
        resultados.forEach(m => {
          if (expInit[m.id] === undefined) expInit[m.id] = true;
        });
        return expInit;
      });
    } catch (error) {
      console.error("Erro ao carregar os dados das matérias", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const toggleExpand = (materiaId) => {
    setExpanded(prev => ({ ...prev, [materiaId]: !prev[materiaId] }));
  };

  const handleSaveMateria = async (nomeMateria, nomeTopico) => {
    try {
      const resMat = await api.post(`/materias/?nome=${encodeURIComponent(nomeMateria)}`);
      const materiaId = resMat.data.materia_id;
      // O estudo base já não é criado na raiz, pertence ao subtópico
      await api.post(`/materias/${materiaId}/topicos/?nome=${encodeURIComponent(nomeTopico)}&estudo_base=false`);
      
      setMateriaModalOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao registar matéria e tópico.");
    }
  };

  const handleSaveTopic = async (nome) => {
    try {
      await api.post(`/materias/${activeMateriaId}/topicos/?nome=${encodeURIComponent(nome)}&estudo_base=false`);
      setTopicModalOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao criar tópico.");
    }
  };

  const handleSaveSubtopic = async (nome, dificuldade) => {
    try {
      await api.post(`/topicos/${activeTopicId}/subtopicos/?nome=${encodeURIComponent(nome)}&dificuldade=${dificuldade}`);
      setSubtopicModalOpen(false);
      carregarDados();
    } catch (error) {
      alert("Erro ao criar subtópico.");
    }
  };

  const toggleStatusRevisao = async (topicoId, subIdx, revNumero) => {
    // Nesta versão com backend real, o ideal é ter uma rota PATCH para alternar o status da revisão.
    // Como a lógica visual exige apenas a interface, pode integrar aqui a chamada api.patch correspondente.
    carregarDados();
  };

  const getCorTag = (corEnum) => {
    switch (corEnum) {
      case "Verde": return "bg-[#E5F3F1] text-[#0D8A72] border-[#D0EBE7]";
      case "Amarelo": return "bg-amber-50 text-amber-600 border-amber-200";
      case "Vermelho": return "bg-rose-50 text-rose-600 border-rose-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F7F7]">
      <div className="w-12 h-12 border-4 border-[#D0EBE7] border-t-[#0D8A72] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-[#F0F7F7] text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D5C53] tracking-tight">Planilha de Acompanhamento</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie os seus estudos teóricos e planeie as repetições espaçadas.</p>
          </div>
          <button 
            onClick={() => setMateriaModalOpen(true)}
            className="bg-[#0D8A72] hover:bg-[#0D5C53] text-white font-bold py-3 px-6 rounded-full shadow-[0_8px_30px_rgb(13,138,114,0.2)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <span>+ Cadastrar Matéria</span>
          </button>
        </div>

        {materiasComDetalhes.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 font-medium rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.08)]">
            Nenhuma matéria registada. Clique no botão acima para começar.
          </div>
        ) : (
          materiasComDetalhes.map((detalhes) => {
            const isExpanded = expanded[detalhes.id];

            return (
              <div key={detalhes.id} className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,116,108,0.08)] mb-8 transition-all duration-300">
                
                {/* Barra Clicável Superior da Matéria (Branca e Suave) */}
                <div 
                  onClick={() => toggleExpand(detalhes.id)}
                  className={`p-6 flex justify-between items-center cursor-pointer hover:bg-[#F8FBFB] transition-colors select-none rounded-[2rem] ${isExpanded ? 'border-b border-slate-100 rounded-b-none' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E5F3F1] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#0D8A72]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <span className="text-xl font-extrabold text-[#0D5C53] tracking-wide uppercase">{detalhes.nome}</span>
                    <span className="hidden sm:inline-flex bg-[#F0F7F7] text-[#0D8A72] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{detalhes.topicos.length} Tópicos</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMateriaId(detalhes.id); setTopicModalOpen(true); }}
                      className="bg-white border border-[#D0EBE7] text-[#0D8A72] hover:bg-[#E5F3F1] text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-all uppercase tracking-wider"
                    >
                      + Novo Tópico
                    </button>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#E5F3F1] text-[#0D8A72]' : 'bg-slate-50 text-slate-400'}`}>
                      {isExpanded ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabela de Conteúdos Internos */}
                {isExpanded && (
                  <div className="animate-fade-in">
                    <TabelaPlanilha 
                      detalhes={detalhes} 
                      onOpenSubtopicModal={(topicoId) => { setActiveTopicId(topicoId); setSubtopicModalOpen(true); }} 
                      onToggleRevisao={toggleStatusRevisao} 
                      getCorTag={getCorTag} 
                      onRefresh={carregarDados}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Modais de Registo (Garantir que eles possuem os React Portals criados anteriormente) */}
        <ModalMateria isOpen={isMateriaModalOpen} onClose={() => setMateriaModalOpen(false)} onSave={handleSaveMateria} />
        <ModalTopico isOpen={isTopicModalOpen} onClose={() => setTopicModalOpen(false)} onSave={handleSaveTopic} />
        <ModalSubtopico isOpen={isSubtopicModalOpen} onClose={() => setSubtopicModalOpen(false)} onSave={handleSaveSubtopic} />
      </div>
    </div>
  );
}