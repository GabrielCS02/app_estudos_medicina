import React, { Fragment, useState, useEffect } from "react";
import api from "../services/api";

const AcertosInput = ({ subtopicoId, valorInicial, onRefresh }) => {
  const [valor, setValor] = useState(valorInicial ?? 0);

  useEffect(() => {
    setValor(valorInicial ?? 0);
  }, [valorInicial]);

  const handleBlur = async () => {
    if (valor === (valorInicial ?? 0)) return;
    try {
      await api.patch(`/subtopicos/${subtopicoId}/acertos?valor=${valor}`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao guardar os acertos.");
    }
  };

  return (
    <input
      type="number"
      min="0"
      max="20"
      className="w-14 bg-[#F0F7F7] border border-[#D0EBE7] rounded-xl p-1.5 text-center font-bold text-[#0D5C53] focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all shadow-inner"
      value={valor}
      onChange={(e) => {
        let v = parseInt(e.target.value);
        if (isNaN(v)) v = 0;
        if (v < 0) v = 0;
        if (v > 20) v = 20;
        setValor(v);
      }}
      onBlur={handleBlur}
    />
  );
};

export default function TabelaPlanilha({
  detalhes,
  onOpenSubtopicModal,
  onToggleRevisao,
  getCorTag,
  onRefresh,
}) {
  if (!detalhes || !detalhes.topicos || detalhes.topicos.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-slate-400 font-medium italic rounded-b-[2rem]">
        Ainda não existem tópicos nesta matéria. Adicione o primeiro!
      </div>
    );
  }

  // Alternador interativo de Estudo Base individual por subtópico
  const handleToggleEstudoBase = async (subtopicoId) => {
    try {
      await api.patch(`/subtopicos/${subtopicoId}/toggle-estudo-base`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o estudo base.");
    }
  };

  return (
    <div className="bg-white overflow-hidden rounded-b-[2rem]">
      <div className="overflow-x-auto p-4 pt-0">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr>
              <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 w-48">Tópico</th>
              <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 w-56">Subtópico</th>
              <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-center w-28">Estudo Base</th>
              <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-center w-28">Data da Aula</th>
              <th className="p-3 font-semibold text-[#0D8A72] text-xs uppercase tracking-wider border-b border-slate-100 text-center w-28 bg-[#F0F7F7]/50 rounded-tl-xl">Rev 1 (24h)</th>
              <th className="p-3 font-semibold text-[#0D8A72] text-xs uppercase tracking-wider border-b border-slate-100 text-center w-28 bg-[#F0F7F7]/50">Rev 2 (7d)</th>
              <th className="p-3 font-semibold text-[#0D8A72] text-xs uppercase tracking-wider border-b border-slate-100 text-center w-28 bg-[#F0F7F7]/50 rounded-tr-xl">Rev 3 (30d)</th>
              <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-center w-24">Acertos</th>
              <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-center w-24">Aprov.</th>
              <th className="p-3 font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-center w-28">Dificuldade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {detalhes.topicos.map((topico) => {
              const rowSpan = topico.subtopicos.length > 0 ? topico.subtopicos.length : 1;
              const bgTopico = "bg-[#F8FBFB]"; 

              return (
                <Fragment key={topico.id}>
                  {topico.subtopicos.length === 0 ? (
                    <tr className="border-b border-slate-50">
                      <td className={`p-4 font-bold text-[#0D5C53] align-top ${bgTopico} rounded-l-xl`}>
                        <div className="flex justify-between flex-col gap-3">
                          <span>{topico.nome}</span>
                          <button
                            onClick={() => onOpenSubtopicModal(topico.id)}
                            className="text-[10px] bg-white border border-[#D0EBE7] text-[#0D8A72] px-3 py-1.5 rounded-full w-fit hover:bg-[#E5F3F1] transition shadow-sm font-bold uppercase tracking-wider"
                          >
                            + Subtópico
                          </button>
                        </div>
                      </td>
                      <td colSpan="9" className="p-4 text-slate-400 italic text-center">
                        Nenhum subtópico registado.
                      </td>
                    </tr>
                  ) : (
                    topico.subtopicos.map((sub, subIdx) => {
                      const aula = sub.aula;
                      const revs = [1, 2, 3].map((num) =>
                        aula ? aula.revisoes.find((r) => r.numero === num) : null
                      );

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          {subIdx === 0 && (
                            <td className={`p-4 font-bold text-[#0D5C53] align-top ${bgTopico} rounded-l-xl`} rowSpan={rowSpan}>
                              <div className="flex justify-between flex-col h-full gap-3">
                                <span>{topico.nome}</span>
                                <button
                                  onClick={() => onOpenSubtopicModal(topico.id)}
                                  className="text-[10px] bg-white border border-[#D0EBE7] text-[#0D8A72] px-3 py-1.5 rounded-full w-fit hover:bg-[#E5F3F1] transition shadow-sm font-bold uppercase tracking-wider mt-3"
                                >
                                  + Subtópico
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="p-4 font-medium text-slate-700">
                            {sub.nome}
                          </td>

                          {/* Estudo Base: Manipulável e Individual */}
                          <td className="p-4 text-center align-middle">
                            <button
                              onClick={() => handleToggleEstudoBase(sub.id)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                                sub.estudo_base
                                  ? "bg-[#E5F3F1] text-[#0D8A72] border border-[#D0EBE7]"
                                  : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {sub.estudo_base ? "✓ Sim" : "Não"}
                            </button>
                          </td>

                          <td className="p-4 text-center font-medium text-slate-500 text-xs">
                            {aula ? (
                              new Date(aula.data_aula).toLocaleDateString("pt-PT")
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {revs.map((rev, rIdx) => (
                            <td key={rIdx} className="p-4 text-center">
                              {!rev ? (
                                <span className="text-slate-300">-</span>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <span className={`text-[10px] font-medium uppercase tracking-wider ${rev.status === "Concluída" ? "text-slate-300 line-through" : "text-slate-500"}`}>
                                    {new Date(rev.data).toLocaleDateString("pt-PT")}
                                  </span>
                                  <button
                                    onClick={() => onToggleRevisao(topico.id, subIdx, rIdx + 1)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${
                                      rev.status === "Concluída"
                                        ? "bg-[#0D8A72] text-white border-[#0D8A72] shadow-md shadow-[#0D8A72]/30"
                                        : "bg-white text-slate-300 border-slate-200 hover:border-[#0D8A72] hover:text-[#0D8A72]"
                                    }`}
                                  >
                                    {rev.status === "Concluída" ? "✓" : ""}
                                  </button>
                                </div>
                              )}
                            </td>
                          ))}

                          <td className="p-4 text-center align-middle">
                            {sub.estudo_base ? (
                              <AcertosInput subtopicoId={sub.id} valorInicial={sub.aproveitamento ? (sub.aproveitamento / 100) * 20 : 0} onRefresh={onRefresh} />
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            {sub.estudo_base ? (
                              <span className={`text-sm font-bold ${sub.aproveitamento >= 70 ? "text-[#0D8A72]" : sub.aproveitamento >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                                {sub.aproveitamento ?? 0}%
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <span className={`px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider inline-block min-w-[80px] shadow-sm border ${getCorTag(sub.dificuldade_cor)}`}>
                              {sub.dificuldade_grau}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}