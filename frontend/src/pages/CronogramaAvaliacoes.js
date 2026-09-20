import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function CronogramaAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consome os dados formatados da rota /cronograma
    const carregarDados = async () => {
      try {
        const response = await api.get("/cronograma");
        setAvaliacoes(response.data);
      } catch (error) {
        console.error("Erro ao carregar o cronograma:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Simula a atualização local do Status ou Tipo de Avaliação
  const handleUpdateInline = (index, campo, valor) => {
    const novasAvaliacoes = [...avaliacoes];
    novasAvaliacoes[index][campo] = valor;
    setAvaliacoes(novasAvaliacoes);
    // Numa versão futura, aqui seria disparado um PATCH /avaliacoes/{id} para a API
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">
        A carregar cronograma...
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Cronograma de Avaliações e Provas
        </h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm font-medium">
          + Nova Avaliação
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Disciplina</th>
                <th className="p-4 font-semibold">Tipo de Avaliação</th>
                <th className="p-4 font-semibold">Conteúdo Cobrado</th>
                <th className="p-4 font-semibold text-center">Data</th>
                <th className="p-4 font-semibold text-center">
                  Dias Restantes
                </th>
                <th className="p-4 font-semibold text-center">Valor</th>
                <th className="p-4 font-semibold text-center">Nota Obtida</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {avaliacoes.map((aval, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">
                    {aval.disciplina}
                  </td>

                  {/* Dropdown Editável: Tipo de Avaliação extraído da folha de cálculo */}
                  <td className="p-4">
                    <select
                      className="border border-gray-300 rounded p-1 bg-white focus:ring-blue-500 focus:border-blue-500 w-full"
                      value={aval.tipo_avaliacao}
                      onChange={(e) =>
                        handleUpdateInline(
                          index,
                          "tipo_avaliacao",
                          e.target.value,
                        )
                      }
                    >
                      <option value="P1">P1</option>
                      <option value="P2">P2</option>
                      <option value="Seminário">Seminário</option>
                      <option value="Relatório de Laboratório">
                        Relatório de Laboratório
                      </option>
                      <option value="OSCE">OSCE</option>
                      <option value="Prova Prática">Prova Prática</option>
                      <option value="Estudo de Caso">Estudo de Caso</option>
                      <option value="Trabalho / Artigo">
                        Trabalho / Artigo
                      </option>
                    </select>
                  </td>

                  <td className="p-4 text-gray-600 truncate max-w-xs">
                    {aval.conteudo_cobrado}
                  </td>

                  <td className="p-4 text-center text-gray-600">
                    {new Date(aval.data).toLocaleDateString("pt-PT")}
                  </td>

                  {/* Regra Dinâmica: Vermelho se dias restantes < 7 */}
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded font-bold ${aval.dias_restantes < 7 ? "text-red-700 bg-red-100" : "text-gray-700 bg-gray-100"}`}
                    >
                      {aval.dias_restantes} dias
                    </span>
                  </td>

                  <td className="p-4 text-center text-gray-600">
                    {aval.valor.toFixed(1)}
                  </td>

                  <td className="p-4 text-center">
                    <input
                      type="number"
                      step="0.1"
                      className="w-16 border border-gray-300 rounded p-1 text-center focus:ring-blue-500"
                      value={aval.nota_obtida || ""}
                      placeholder="-"
                      onChange={(e) =>
                        handleUpdateInline(
                          index,
                          "nota_obtida",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </td>

                  {/* Dropdown Editável: Status */}
                  <td className="p-4">
                    <select
                      className={`border rounded p-1 font-medium focus:ring-blue-500 w-full ${
                        aval.status === "Concluído"
                          ? "text-green-700 bg-green-50 border-green-200"
                          : aval.status === "Pendente"
                            ? "text-yellow-700 bg-yellow-50 border-yellow-200"
                            : "text-blue-700 bg-blue-50 border-blue-200"
                      }`}
                      value={aval.status}
                      onChange={(e) =>
                        handleUpdateInline(index, "status", e.target.value)
                      }
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </td>
                </tr>
              ))}

              {avaliacoes.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    Nenhuma avaliação registada no cronograma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
