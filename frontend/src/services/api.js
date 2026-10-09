import axios from 'axios';

// URL de produção gerada pelo Render
const api = axios.create({
  baseURL: 'https://app-estudos-medicina.onrender.com',
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