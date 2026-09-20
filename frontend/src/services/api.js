import axios from 'axios';

// Instância apontando para o backend FastAPI local configurado no Chat 2
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const getDashboardData = async () => {
  const response = await api.get('/dashboard/visao-geral');
  return response.data;
};

export const getCronograma = async () => {
  const response = await api.get('/cronograma');
  return response.data;
};

export const registrarAula = async (subtopicoId, data) => {
  const response = await api.post(`/subtopicos/${subtopicoId}/registrar-aula`, data);
  return response.data;
};

export default api;