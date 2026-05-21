// src/pages/DashboardSecretario.jsx
// Painel da secretaria. Funciona como um atalho visual pra tabela de filas.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutBase from '../components/LayoutBase';

function DashboardSecretario() {
  const navigate = useNavigate();
  const localData = JSON.parse(localStorage.getItem('usuarioSIPE')) || {};
  
  // Objeto de estado pra não criar 10 variáveis diferentes
  const [stats, setStats] = useState({
    fila_global: 0, atribuidas: 0, recebido: 0, em_analise: 0,
    em_confeccao: 0, aguardando_assinatura: 0, deferido: 0,
    indeferido: 0, finalizado: 0, cancelado: 0
  });
  const [carregando, setCarregando] = useState(true);

  // Assim que a tela abre, pede as estatísticas matemáticas lá do PHP
  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const response = await fetch(`http://localhost/pdgdsa/backend/estatisticas_secretario.php?id_secretario=${localData.id}`);
        const data = await response.json();
        if (data.sucesso) setStats(data.estatisticas);
      } catch (error) { 
        console.error("Erro no PHP de stats", error); 
      } finally { 
        setCarregando(false); 
      }
    };
    carregarEstatisticas();
  }, [localData.id]);

  // Função mágica de navegação: Joga o cara pra página da tabela, mas mandando um "state" junto
  // pra tabela já abrir com o filtro ativado! Economiza cliques.
  const irPara = (aba, status) => {
    navigate('/minhas_solicitacoes', { state: { aba: aba, status: status } });
  };

  // REUTILIZAÇÃO DE CÓDIGO (React puro!): Componente "Card"
  // Em vez de copiar e colar a div 10 vezes, criei esse mini-componente aqui dentro
  const Card = ({ titulo, valor, corBorder, corIcone, icone, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${corBorder} cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:bg-blue-50/30 transition-all duration-200 group`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">{titulo}</p>
          <h3 className="text-3xl font-black text-gray-800 mt-2">
            {carregando ? <i className="fas fa-spinner fa-spin text-sm text-gray-300"></i> : valor}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity ${corIcone}`}>
          <i className={`fas ${icone} text-lg`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <LayoutBase tituloPagina="Dashboard Operacional">
      
      {/* SEÇÃO 1: FILAS DE TRABALHO PESSOAL */}
      <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest"><i className="fas fa-user-tie mr-2 text-gov-blue"></i> Meu Fluxo de Trabalho</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card titulo="Fila Global (Livres)" valor={stats.fila_global} corBorder="border-blue-400" corIcone="text-blue-500" icone="fa-globe" onClick={() => irPara('global', null)} />
        <Card titulo="Minhas Atribuições" valor={stats.atribuidas} corBorder="border-purple-500" corIcone="text-purple-600" icone="fa-user-check" onClick={() => irPara('pessoal', null)} />
      </div>

      {/* SEÇÃO 2: VISÃO GERAL DE TODOS OS STATUS */}
      <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest"><i className="fas fa-tasks mr-2 text-gov-blue"></i> Visão Geral do Sistema</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Passando os status exatos do banco pra função mágica de rota */}
        <Card titulo="Recebidos" valor={stats.recebido} corBorder="border-gray-400" corIcone="text-gray-500" icone="fa-inbox" onClick={() => irPara('todas', 'RECEBIDO')} />
        <Card titulo="Em Análise" valor={stats.em_analise} corBorder="border-yellow-400" corIcone="text-yellow-500" icone="fa-search" onClick={() => irPara('todas', 'EM_ANALISE')} />
        <Card titulo="Deferidos" valor={stats.deferido} corBorder="border-teal-400" corIcone="text-teal-500" icone="fa-check" onClick={() => irPara('todas', 'DEFERIDO')} />
        <Card titulo="Em Confecção" valor={stats.em_confeccao} corBorder="border-blue-400" corIcone="text-blue-500" icone="fa-print" onClick={() => irPara('todas', 'EM-CONFECCAO')} />
        
        <Card titulo="Aguard. Assinatura" valor={stats.aguardando_assinatura} corBorder="border-indigo-400" corIcone="text-indigo-500" icone="fa-pen-nib" onClick={() => irPara('todas', 'AGUARDANDO_ASSINATURA')} />
        <Card titulo="Indeferidos" valor={stats.indeferido} corBorder="border-orange-400" corIcone="text-orange-500" icone="fa-times-circle" onClick={() => irPara('todas', 'INDEFERIDO')} />
        <Card titulo="Cancelados" valor={stats.cancelado} corBorder="border-red-400" corIcone="text-red-500" icone="fa-ban" onClick={() => irPara('todas', 'CANCELADO')} />
        <Card titulo="Finalizados" valor={stats.finalizado} corBorder="border-green-500" corIcone="text-green-600" icone="fa-check-double" onClick={() => irPara('todas', 'FINALIZADO')} />
      </div>

    </LayoutBase>
  );
}

export default DashboardSecretario;