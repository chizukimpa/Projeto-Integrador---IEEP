// src/pages/MetricasAtendimento.jsx
// TODO: Expandir essa tela pro TCC pra gerar gráficos em PDF, por enquanto fica o aviso de em construção.
import React from 'react';
import LayoutBase from '../components/LayoutBase';

function MetricasAtendimento() {
  return (
    <LayoutBase tituloPagina="Métricas e Relatórios">
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gov-blue text-center" data-aos="zoom-in">
        <i className="fas fa-tools text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Página em Construção</h2>
        <p className="text-gray-500">
          Aqui construiremos os relatórios de produtividade (quantas solicitações cada secretário resolveu, tempo médio de resposta, etc).
        </p>
      </div>
    </LayoutBase>
  );
}

export default MetricasAtendimento;