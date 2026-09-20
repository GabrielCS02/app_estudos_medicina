import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function ModuloRevisoes() {
  const [subtopicoId, setSubtopicoId] = useState("");
  const [dataAula, setDataAula] = useState("");
  const [acertos, setAcertos] = useState(0);
  const [datasRevisao, setDatasRevisao] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados exclusivos para o Autocomplete de Subtópicos
  const [searchTerm, setSearchTerm] = useState("");
  const [subtopicosList, setSubtopicosList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Regra A5: O 100% de aproveitamento baseia-se em um bloco padrão de 20 questões[cite: 3]
  const percentual = ((acertos / 20) * 100).toFixed(1);

  // Carrega a lista de subtópicos ao abrir a tela
  useEffect(() => {
    api.get("/subtopicos/")
      .then(response => setSubtopicosList(response.data))
      .catch(error => console.error("Erro ao carregar subtópicos", error));
  }, []);

  // Lógica de filtragem ("complementar escrita")
  const subtopicosFiltrados = subtopicosList.filter(sub =>
    sub.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subtopicoId) {
      alert("Por favor, selecione um subtópico válido na lista.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(
        `/subtopicos/${subtopicoId}/registrar-aula?data_aula=${dataAula}&acertos=${acertos}`,
      );
      setDatasRevisao(response.data.datas_revisao);
    } catch (error) {
      console.error("Erro ao registrar revisão", error);
      alert("Houve um erro na comunicação com a API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Registro de Aula e Questões
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
        >
          {/* Campo Autocomplete de Subtópico */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Subtópico
            </label>
            <input
              type="text"
              placeholder="Digite para buscar..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
                setSubtopicoId(""); // Reseta o ID caso o usuário mude o texto após selecionar
              }}
              onFocus={() => setIsDropdownOpen(true)}
              // O timeout garante que o clique na lista ocorra antes de o menu fechar
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              required
            />
            
            {/* Lista Suspensa (Dropdown) */}
            {isDropdownOpen && searchTerm && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {subtopicosFiltrados.length > 0 ? (
                  subtopicosFiltrados.map((sub) => (
                    <li
                      key={sub.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0"
                      onClick={() => {
                        setSubtopicoId(sub.id);
                        setSearchTerm(sub.nome); // Preenche o input com o nome completo
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="font-semibold text-blue-600 mr-2">#{sub.id}</span>
                      {sub.nome}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500">
                    Nenhum subtópico encontrado
                  </li>
                )}
              </ul>
            )}
          </div>

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

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Desempenho (Bloco de 20 Questões)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="20"
                className="w-24 border border-gray-300 rounded-md p-2 text-center text-lg font-bold text-blue-700 focus:ring-blue-500"
                value={acertos}
                onChange={(e) => setAcertos(Number(e.target.value))}
                required
              />
              <span className="text-gray-600 font-medium">acertos</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Aproveitamento Calculado:
              </span>
              <span
                className={`text-xl font-bold ${percentual >= 70 ? "text-green-600" : percentual >= 50 ? "text-yellow-600" : "text-red-600"}`}
              >
                {percentual}%
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium shadow-sm disabled:bg-blue-300"
          >
            {loading ? "Processando..." : "Registrar e Agendar Revisões"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
            Status do Agendamento
          </h2>

          {!datasRevisao ? (
            <div className="text-center text-gray-400 py-10 flex flex-col items-center">
              <svg
                className="w-12 h-12 mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <p>
                Registre a aula para gerar o cronograma de repetição espaçada.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-blue-200 ml-3 space-y-8">
              <div className="relative pl-6">
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 border-2 border-white"></div>
                <h3 className="font-bold text-blue-800">Revisão 1 (+1 dia)</h3>
                <p className="text-gray-600 mt-1">
                  {new Date(datasRevisao.rev_1).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="relative pl-6">
                <div className="absolute w-4 h-4 bg-blue-400 rounded-full -left-[9px] top-1 border-2 border-white"></div>
                <h3 className="font-bold text-blue-700">Revisão 2 (+7 dias)</h3>
                <p className="text-gray-600 mt-1">
                  {new Date(datasRevisao.rev_2).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="relative pl-6">
                <div className="absolute w-4 h-4 bg-blue-300 rounded-full -left-[9px] top-1 border-2 border-white"></div>
                <h3 className="font-bold text-blue-600">
                  Revisão 3 (+30 dias)
                </h3>
                <p className="text-gray-600 mt-1">
                  {new Date(datasRevisao.rev_3).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}