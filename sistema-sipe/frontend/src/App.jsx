import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importando nossos componentes e páginas
import LayoutBase from './components/LayoutBase';
import Login from './pages/Login';
import DashboardAluno from './pages/DashboardAluno';
import DashboardSecretario from './pages/DashboardSecretario';
import DashboardAdm from './pages/DashboardAdm';
import MinhasSolicitacoes from './pages/MinhasSolicitacoes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A Rota Principal (Raiz) abre o Login */}
        <Route path="/" element={<Login />} />
        
        {/* As Rotas Iniciais dos Dashboards */}
        <Route path="/dashboard_aluno" element={<DashboardAluno />} />
        <Route path="/dashboard_secretario" element={<DashboardSecretario />} />
        <Route path="/dashboard_adm" element={<DashboardAdm />} />
        
        {/* Rotas de Funcionalidades */}
        <Route path="/minhas_solicitacoes" element={<MinhasSolicitacoes />} />
        <Route path="/gerenciar_usuarios" element={<DashboardAdm />} /> 
        
        {/* Rota de Configurações (Página em Desenvolvimento) */}
        <Route path="/configuracoes" element={
          <LayoutBase tituloPagina="Perfil do Usuário">
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-gov-blue">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Configurações de Conta</h2>
              <p className="text-gray-600">Esta funcionalidade está em desenvolvimento e será liberada em breve.</p>
            </div>
          </LayoutBase>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;