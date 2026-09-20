import axios from 'axios';

// Instância apontando diretamente para o terminal do seu FastAPI
const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

export const getDashboardData = async () => {
  const response = await api.get('/dashboard/visao-geral');
  return response.data;
};

export default api;