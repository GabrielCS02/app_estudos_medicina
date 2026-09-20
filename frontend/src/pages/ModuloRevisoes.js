import React, { useState } from "react";
import api from "../services/api";

export default function ModuloRevisoes() {
  const [subtopicoId, setSubtopicoId] = useState("");
  const [dataAula, setDataAula] = useState("");
  const [acertos, setAcertos] = useState(0);
  const [datasRevisao, setDatasRevisao] = useState(null);
  const [loading, setLoading] = useState(false);

  // Regra A5: O 100% de aproveitamento baseia-se em um bloco padrão de 20 questões
  const percentual = ((acertos / 20) * 100).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Consome o endpoint POST /subtopicos/{subtopico_id}/registrar-aula
      const response = await api.post(
        `/subtopicos/${subtopicoId}/registrar-aula?data_aula=${dataAula}&acertos=${acertos}`,
      );

      // Armazena as datas calculadas pelo backend (1, 7 e 30 dias)
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
        {/* Formulário de Input */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Subtópico
            </label>
            <input
              type="number"
              placeholder="Ex: 1 (Para MVP, digite o ID numérico)"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={subtopicoId}
              onChange={(e) => setSubtopicoId(e.target.value)}
              required
            />
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

            {/* Feedback visual dinâmico em tempo real */}
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

        {/* Timeline de Revisões (Renderização Condicional) */}
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
              {/* Revisão 1 (24h) */}
              <div className="relative pl-6">
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 border-2 border-white"></div>
                <h3 className="font-bold text-blue-800">Revisão 1 (+1 dia)</h3>
                <p className="text-gray-600 mt-1">
                  {new Date(datasRevisao.rev_1).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Revisão 2 (7 dias) */}
              <div className="relative pl-6">
                <div className="absolute w-4 h-4 bg-blue-400 rounded-full -left-[9px] top-1 border-2 border-white"></div>
                <h3 className="font-bold text-blue-700">Revisão 2 (+7 dias)</h3>
                <p className="text-gray-600 mt-1">
                  {new Date(datasRevisao.rev_2).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Revisão 3 (30 dias) */}
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
