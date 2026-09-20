import os

# 1. Cria a pasta public exigida pelo React
os.makedirs("public", exist_ok=True)

html_content = """<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>App Estudos Medicina</title>
    <!-- Tailwind injetado via CDN para termos o design instantaneamente sem setups pesados -->
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>Ative o JavaScript para rodar o app.</noscript>
    <div id="root"></div>
  </body>
</html>"""

index_js_content = """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);"""

app_js_content = """import React from 'react';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}"""

api_js_content = """import axios from 'axios';

// Instância apontando diretamente para o terminal do seu FastAPI
const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

export const getDashboardData = async () => {
  const response = await api.get('/dashboard/visao-geral');
  return response.data;
};

export default api;"""

# 2. Escreve os arquivos nos locais exatos
with open("public/index.html", "w", encoding="utf-8") as f: f.write(html_content)
with open("src/index.js", "w", encoding="utf-8") as f: f.write(index_js_content)
with open("src/App.js", "w", encoding="utf-8") as f: f.write(app_js_content)
with open("src/services/api.js", "w", encoding="utf-8") as f: f.write(api_js_content)

print("Arquivos raiz do React criados com sucesso! O esqueleto visual e a conexão com a API estão prontos.")