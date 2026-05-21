// src/App.jsx
// Roteamento principal do sistema. O React Router DOM foi a melhor escolha pra não ter que recarregar a página inteira a cada clique.
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LayoutBase from './components/LayoutBase';
import Login from './pages/Login';
import DashboardAluno from './pages/DashboardAluno';
import DashboardSecretario from './pages/DashboardSecretario';
import DashboardAdm from './pages/DashboardAdm';
import MinhasSolicitacoes from './pages/MinhasSolicitacoes';
import GestaoUsuarios from './pages/GestaoUsuarios';
import MetricasAtendimento from './pages/MetricasAtendimento';
import Configuracoes from './pages/Configuracoes'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* Rotas Privadas (A proteção quem faz é o LayoutBase, se o cara não tiver logado ele chuta pro Login) */}
        <Route path="/dashboard_aluno" element={<DashboardAluno />} />
        <Route path="/dashboard_secretario" element={<DashboardSecretario />} />
        <Route path="/dashboard_adm" element={<DashboardAdm />} />
        
        <Route path="/minhas_solicitacoes" element={<MinhasSolicitacoes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/gestao_usuarios" element={<GestaoUsuarios />} />
        <Route path="/metricas_atendimento" element={<MetricasAtendimento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;