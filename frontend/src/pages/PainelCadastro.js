import React, { useState } from "react";
import api from "../services/api";

export default function PainelCadastro() {
  // Estados para a Hierarquia (A1)
  const [materia, setMateria] = useState("");
  const [topico, setTopico] = useState("");
  const [subtopico, setSubtopico] = useState("");

  // Estados para os Metadados da Aula (A2, A3, A4 e A7)
  const [dataAula, setDataAula] = useState("");
  const [estudoBase, setEstudoBase] = useState(false);
  const [dificuldade, setDificuldade] = useState(0);

  // Lógica de Cores da Dificuldade (Regra A7: 0-3 Verde, 4-7 Amarelo, 8-10 Vermelho)
  const getCorDificuldade = (valor) => {
    if (valor <= 3) return "text-green-600 bg-green-100 border-green-500";
    if (valor <= 7) return "text-yellow-600 bg-yellow-100 border-yellow-500";
    return "text-red-600 bg-red-100 border-red-500";
  };

  const getCorSlider = (valor) => {
    if (valor <= 3) return "accent-green-500";
    if (valor <= 7) return "accent-yellow-500";
    return "accent-red-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Salva ou recupera a Matéria (a API evitará duplicatas e retornará o ID)
      const resMateria = await api.post(
        `/materias/?nome=${encodeURIComponent(materia)}`,
      );
      const materiaId = resMateria.data.materia_id;
      const nomeMateriaReal = resMateria.data.nome;

      // 2. Salva o Tópico atrelado à Matéria
      const resTopico = await api.post(
        `/materias/${materiaId}/topicos/?nome=${encodeURIComponent(topico)}&estudo_base=${estudoBase}`,
      );
      const topicoId = resTopico.data.topico_id;

      // 3. Salva o Subtópico atrelado ao Tópico
      await api.post(
        `/topicos/${topicoId}/subtopicos/?nome=${encodeURIComponent(subtopico)}&dificuldade=${dificuldade}`,
      );

      alert(
        `Sucesso! A estrutura de estudos em "${nomeMateriaReal}" foi cadastrada e salva no banco de dados.`,
      );

      // Limpa os campos após o sucesso para facilitar um novo cadastro
      setMateria("");
      setTopico("");
      setSubtopico("");
      setDataAula("");
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      alert(
        "Houve um erro de comunicação com a API. Verifique se o terminal do backend está rodando.",
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Novo Cadastro de Estudo
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6"
      >
        {/* Seção 1: Hierarquia */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            1. Estrutura do Conteúdo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matéria
              </label>
              <input
                type="text"
                placeholder="Ex: Anatomia"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tópico
              </label>
              <input
                type="text"
                placeholder="Ex: Membros Superiores"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                value={topico}
                onChange={(e) => setTopico(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtópico
              </label>
              <input
                type="text"
                placeholder="Ex: Ossos do Braço"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                value={subtopico}
                onChange={(e) => setSubtopico(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Metadados da Aula */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            2. Detalhes da Aula
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Data e Estudo Base */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Aula
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={dataAula}
                  onChange={(e) => setDataAula(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={estudoBase}
                    onChange={(e) => setEstudoBase(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  Realizou Estudo Base?
                </span>
              </div>
            </div>

            {/* Dificuldade do Subtópico */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Grau de Dificuldade (0 a 10)
              </label>

              <input
                type="range"
                min="0"
                max="10"
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${getCorSlider(dificuldade)}`}
                value={dificuldade}
                onChange={(e) => setDificuldade(Number(e.target.value))}
              />

              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Muito Fácil</span>
                <div
                  className={`px-4 py-2 border rounded-md font-bold text-lg text-center min-w-[3rem] ${getCorDificuldade(dificuldade)}`}
                >
                  {dificuldade}
                </div>
                <span className="text-sm text-gray-500">Muito Difícil</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium shadow-sm"
          >
            Salvar e Agendar Revisões
          </button>
        </div>
      </form>
    </div>
  );
}
