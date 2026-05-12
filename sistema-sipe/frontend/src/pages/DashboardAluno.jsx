import React, { useState } from 'react';
import LayoutBase from '../components/LayoutBase';

function DashboardAluno() {
  const usuario = JSON.parse(localStorage.getItem('usuarioSIPE')) || { nome: 'Aluno', rota: '/', id: 1 };

  // O idTipo agora começa no 1 (Histórico Escolar) e vai até o 3
  const [idTipo, setIdTipo] = useState('1');
  const [prioridade, setPrioridade] = useState('COMUM');
  const [justificativa, setJustificativa] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const dadosParaEnviar = {
      id_tipo: parseInt(idTipo),
      prioridade: prioridade,
      justificativa: justificativa,
      id_usuario: usuario.id || 1
    };

    try {
      const response = await fetch('http://localhost/pdgdsa/backend/nova_solicitacao.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar)
      });

      const data = await response.json();

      if (data.sucesso) {
        alert(`${data.mensagem}\nNúmero do Protocolo: ${data.protocolo}`);
        setJustificativa('');
      } else {
        alert('Erro ao criar solicitação: ' + data.mensagem);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert('Erro ao conectar com o servidor. Verifique o XAMPP.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LayoutBase tituloPagina="Portal do Aluno">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* FORMULÁRIO DE NOVA SOLICITAÇÃO */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-t-4 border-gov-blue">
          <h2 className="text-lg font-bold mb-6 flex items-center text-gov-blue">
            <i className="fas fa-plus-circle mr-2"></i> Nova Solicitação
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Documento Desejado</label>
                <select 
                  className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-gov-blue outline-none"
                  value={idTipo}
                  onChange={(e) => setIdTipo(e.target.value)}
                >
                  {/* AS 3 OPÇÕES DE DOCUMENTOS ATUALIZADAS AQUI */}
                  <option value="1">Histórico Escolar</option>
                  <option value="2">Certificado</option>
                  <option value="3">Comprovante de Matrícula</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Prioridade</label>
                <select 
                  className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-gov-blue outline-none font-bold text-sm"
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                >
                  <option value="COMUM" className="text-gray-700">COMUM</option>
                  <option value="URGENTE" className="text-red-600 font-bold">URGENTE</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Justificativa do Pedido</label>
              <textarea 
                className="w-full p-2 border rounded bg-gray-50 h-32 focus:ring-2 focus:ring-gov-blue outline-none" 
                placeholder="Descreva detalhadamente o motivo da sua solicitação..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={carregando}
              className={`w-full ${carregando ? 'bg-gray-400' : 'bg-gov-green hover:bg-green-800'} text-white font-bold py-3 rounded-lg shadow-md transition-all flex justify-center items-center`}
            >
              {carregando ? (
                <span><i className="fas fa-spinner fa-spin mr-2"></i> Processando...</span>
              ) : (
                "Abrir Protocolo"
              )}
            </button>
          </form>
        </div>

        {/* CARD INFORMATIVO */}
        <div className="bg-gov-blue text-white p-8 rounded-xl shadow-lg flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-4">Informações Importantes</h3>
          <ul className="text-sm space-y-4 opacity-90">
            <li className="flex items-start">
              <i className="fas fa-clock mt-1 mr-3"></i>
              <span><strong>Prazo médio:</strong> 15 dias úteis.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-search mt-1 mr-3"></i>
              <span>Acompanhe o status na aba <strong>"Solicitações"</strong>.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-exclamation-triangle mt-1 mr-3"></i>
              <span>Documentos urgentes exigem comprovação anexada ou justificativa plausível.</span>
            </li>
          </ul>
        </div>
      </div>
    </LayoutBase>
  );
}

export default DashboardAluno;