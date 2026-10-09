import axios from 'axios';

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

export default api;