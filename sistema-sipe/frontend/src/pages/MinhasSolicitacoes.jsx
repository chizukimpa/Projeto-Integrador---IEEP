import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutBase from '../components/LayoutBase';

function MinhasSolicitacoes() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuarioSIPE')) || { nome: 'Usuário', rota: '/', id: 1 };
  const isAluno = usuario.rota === '/dashboard_aluno';

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const [tempStatus, setTempStatus] = useState([]);
  const [tempPrioridade, setTempPrioridade] = useState([]);
  const [filtrosAtivosStatus, setFiltrosAtivosStatus] = useState([]);
  const [filtrosAtivosPrioridade, setFiltrosAtivosPrioridade] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'dataAbertura', direction: 'desc' });

  // ESTADOS DO MODAL DO SECRETÁRIO
  const [modalAberto, setModalAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [atribuidoAMim, setAtribuidoAMim] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [isAluno, usuario.id]);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const url = isAluno 
        ? `http://localhost/pdgdsa/backend/listar_solicitacoes.php?id_usuario=${usuario.id || 1}`
        : `http://localhost/pdgdsa/backend/listar_solicitacoes.php`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.sucesso && Array.isArray(data.dados)) {
        setSolicitacoes(data.dados);
      } else {
        setSolicitacoes([]);
      }
    } catch (error) {
      setSolicitacoes([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleAtualizarStatus = async () => {
    setSalvandoStatus(true);
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/atualizar_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolo: solicitacaoSelecionada.protocolo,
          novo_status: novoStatus
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        setSolicitacoes(solicitacoes.map(c => 
          c.protocolo === solicitacaoSelecionada.protocolo ? { ...c, status: novoStatus } : c
        ));
        setModalAberto(false);
        alert(atribuidoAMim ? "Solicitação atribuída a você e status atualizado!" : data.mensagem);
      } else {
        alert('Erro: ' + data.mensagem);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setSalvandoStatus(false);
    }
  };

  const abrirModal = (solicitacao) => {
    if (!isAluno) {
      setSolicitacaoSelecionada(solicitacao);
      setNovoStatus(solicitacao.status);
      setAtribuidoAMim(false); 
      setModalAberto(true);
    }
  };

  const toggleMenuFiltros = () => {
    if (!mostrarFiltros) {
      setTempStatus(filtrosAtivosStatus);
      setTempPrioridade(filtrosAtivosPrioridade);
    }
    setMostrarFiltros(!mostrarFiltros);
  };

  const aplicarFiltros = () => {
    setFiltrosAtivosStatus(tempStatus);
    setFiltrosAtivosPrioridade(tempPrioridade);
    setMostrarFiltros(false);
  };

  const limparFiltros = () => {
    setTempStatus([]); setTempPrioridade([]); setFiltrosAtivosStatus([]); setFiltrosAtivosPrioridade([]);
    setMostrarFiltros(false);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  let dadosProcessados = [...solicitacoes];

  if (busca) {
    dadosProcessados = dadosProcessados.filter(c => 
      (c.protocolo || '').toLowerCase().includes(busca.toLowerCase()) ||
      (c.requerente || '').toLowerCase().includes(busca.toLowerCase()) ||
      (c.documento || '').toLowerCase().includes(busca.toLowerCase())
    );
  }

  if (filtrosAtivosStatus.length > 0) dadosProcessados = dadosProcessados.filter(c => filtrosAtivosStatus.includes(c.status));
  if (filtrosAtivosPrioridade.length > 0) dadosProcessados = dadosProcessados.filter(c => filtrosAtivosPrioridade.includes(c.prioridade));

  dadosProcessados.sort((a, b) => {
    const parseDate = (d) => {
      if(!d || d === 'Em processamento') return 0;
      try {
        const partes = String(d).split(' ');
        if(!partes[0]) return 0;
        const [dia, mes, ano] = partes[0].split('/');
        if(!ano) return 0;
        const [h, m] = partes[1] ? partes[1].split(':') : [0, 0];
        return new Date(ano, mes - 1, dia, h, m).getTime();
      } catch (e) {
        return 0; 
      }
    };

    let vA = a[sortConfig.key], vB = b[sortConfig.key];
    if (sortConfig.key === 'prazo' || sortConfig.key === 'dataAbertura') { 
      vA = parseDate(vA); 
      vB = parseDate(vB); 
    }
    else if (sortConfig.key === 'prioridade') { 
      vA = vA === 'URGENTE' ? 2 : 1; 
      vB = vB === 'URGENTE' ? 2 : 1; 
    }
    else { 
      vA = vA ? vA.toString().toLowerCase() : ''; 
      vB = vB ? vB.toString().toLowerCase() : ''; 
    }

    if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusColor = (s) => {
    const colors = { 
      'RECEBIDO': 'bg-gray-100 text-gray-800 border-gray-300', 
      'EM_ANALISE': 'bg-yellow-100 text-yellow-800 border-yellow-300', 
      'EM-CONFECCAO': 'bg-blue-100 text-blue-800 border-blue-300', 
      'AGUARDANDO_ASSINATURA': 'bg-purple-100 text-purple-800 border-purple-300',
      'DEFERIDO': 'bg-teal-100 text-teal-800 border-teal-300',
      'FINALIZADO': 'bg-green-100 text-green-800 border-green-300', 
      'INDEFERIDO': 'bg-orange-100 text-orange-800 border-orange-300',
      'CANCELADO': 'bg-red-200 text-red-900 border-red-400' 
    };
    return colors[s] || 'bg-gray-100 text-gray-800';
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <i className="fas fa-sort ml-1 text-gray-300"></i>;
    return <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1 text-gov-blue`}></i>;
  };

  return (
    <LayoutBase tituloPagina={isAluno ? "Minhas Solicitações" : "Central de Atendimento (Caixa de Entrada)"}>
      
      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
        <div className="flex space-x-2">
          {isAluno && (
            <button onClick={() => navigate('/dashboard_aluno')} className="bg-gov-blue text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-800 transition">
              <i className="fas fa-plus mr-2"></i> Nova Solicitação
            </button>
          )}
          
          <div className="relative">
            <button onClick={toggleMenuFiltros} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <i className="fas fa-filter mr-2"></i> Filtros {filtrosAtivosStatus.length + filtrosAtivosPrioridade.length > 0 && `(${filtrosAtivosStatus.length + filtrosAtivosPrioridade.length})`}
            </button>
            
            {mostrarFiltros && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 animate-fadeIn">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Filtrar por Status</p>
                <div className="space-y-1 mb-4">
                  {['RECEBIDO', 'EM_ANALISE', 'EM-CONFECCAO', 'AGUARDANDO_ASSINATURA', 'DEFERIDO', 'INDEFERIDO', 'FINALIZADO', 'CANCELADO'].map(s => (
                    <label key={s} className="flex items-center p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-gov-blue" checked={tempStatus.includes(s)} onChange={() => setTempStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} /> {s.replace('_', ' ')}
                    </label>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-3 border-t">
                  <button onClick={limparFiltros} className="text-[11px] font-bold text-red-500 uppercase">Limpar</button>
                  <button onClick={aplicarFiltros} className="bg-gov-blue text-white px-4 py-1.5 rounded text-[11px] font-bold uppercase shadow-sm">Aplicar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Pesquisar protocolo ou documento..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gov-blue/20 transition" 
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
          />
          <i className="fas fa-search absolute left-3.5 top-2.5 text-gray-400 text-sm"></i>
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-xl overflow-hidden border border-gray-100 relative z-10">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('protocolo')}>Protocolo <SortIcon col="protocolo" /></th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('dataAbertura')}>Data / Hora <SortIcon col="dataAbertura" /></th>
              {!isAluno && <th className="p-4 cursor-pointer" onClick={() => handleSort('requerente')}>Requerente <SortIcon col="requerente" /></th>}
              <th className="p-4 cursor-pointer" onClick={() => handleSort('documento')}>Documento <SortIcon col="documento" /></th>
              <th className="p-4 text-center">Prioridade</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right cursor-pointer" onClick={() => handleSort('prazo')}>Prazo Final <SortIcon col="prazo" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {carregando ? (
              <tr><td colSpan="7" className="p-10 text-center"><i className="fas fa-circle-notch fa-spin text-gov-blue text-2xl"></i></td></tr>
            ) : dadosProcessados.length === 0 ? (
              <tr><td colSpan="7" className="p-10 text-center text-gray-400 italic">Nenhuma solicitação encontrada no sistema.</td></tr>
            ) : (
              dadosProcessados.map((c, i) => (
                <tr 
                  key={i} 
                  onClick={() => abrirModal(c)}
                  className={`hover:bg-blue-50/50 transition group ${!isAluno ? 'cursor-pointer' : ''}`}
                  title={!isAluno ? "Clique para gerenciar esta solicitação" : ""}
                >
                  <td className="p-4 font-mono font-bold text-gov-blue">{c.protocolo || 'N/A'}</td>
                  <td className="p-4 text-gray-500 text-xs">{c.dataAbertura || '--'}</td>
                  {!isAluno && <td className="p-4"><p className="font-bold text-gray-800 leading-none">{c.requerente || 'Sem nome'}</p><p className="text-[10px] text-gray-400 mt-1">{c.matricula || '--'}</p></td>}
                  <td className="p-4 text-gray-600 font-medium">{c.documento || 'Sem registo'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${(c.prioridade || '') === 'URGENTE' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>
                      {c.prioridade || 'COMUM'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`border px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(c.status)}`}>
                      {(c.status || '').replace('_', ' ') || 'DESCONHECIDO'}
                    </span>
                  </td>
                  <td className="p-4 text-right text-xs font-bold text-red-600">{c.prazo || 'Em processamento'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JANELA MODAL DO SECRETÁRIO COM OPÇÃO DE ATRIBUIR */}
      {modalAberto && solicitacaoSelecionada && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" data-aos="zoom-in">
            
            <div className="bg-gov-blue p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg"><i className="fas fa-edit mr-2"></i> Gerenciar Solicitação</h3>
              <button onClick={() => setModalAberto(false)} className="text-blue-200 hover:text-white transition">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                <div className="flex justify-between items-start mb-2 border-b border-gray-200 pb-2">
                  <p><span className="text-gray-500 font-bold">Protocolo:</span> <span className="font-mono text-gov-blue font-bold">{solicitacaoSelecionada.protocolo}</span></p>
                  <p className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-200 text-gray-600">Não Atribuído</p>
                </div>
                <p className="mb-1"><span className="text-gray-500 font-bold">Requerente:</span> {solicitacaoSelecionada.requerente} ({solicitacaoSelecionada.matricula})</p>
                <p><span className="text-gray-500 font-bold">Documento:</span> {solicitacaoSelecionada.documento}</p>
              </div>

              {!atribuidoAMim && solicitacaoSelecionada.status === 'RECEBIDO' && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-blue-800 font-medium">Assuma a responsabilidade por esta solicitação:</span>
                  <button 
                    onClick={() => { setAtribuidoAMim(true); setNovoStatus('EM_ANALISE'); }}
                    className="bg-gov-blue text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-800 transition shadow-sm"
                  >
                    Atribuir a mim
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Atualizar Status</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none text-sm font-bold text-gray-700"
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value)}
                  disabled={solicitacaoSelecionada.status === 'RECEBIDO' && !atribuidoAMim}
                >
                  <option value="RECEBIDO">Recebido (Fila Geral)</option>
                  <option value="EM_ANALISE">Em Análise</option>
                  <option value="EM-CONFECCAO">Em Confecção</option>
                  <option value="AGUARDANDO_ASSINATURA">Aguardando Assinatura</option>
                  <option value="DEFERIDO">Deferido</option>
                  <option value="INDEFERIDO">Indeferido</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
                {solicitacaoSelecionada.status === 'RECEBIDO' && !atribuidoAMim && (
                  <p className="text-[10px] text-red-500 mt-1 italic">*Atribua a solicitação a você para alterar o status.</p>
                )}
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button 
                onClick={() => setModalAberto(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAtualizarStatus}
                disabled={salvandoStatus || (solicitacaoSelecionada.status === 'RECEBIDO' && !atribuidoAMim)}
                className={`text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition flex items-center ${salvandoStatus || (solicitacaoSelecionada.status === 'RECEBIDO' && !atribuidoAMim) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gov-green hover:bg-green-800'}`}
              >
                {salvandoStatus ? <><i className="fas fa-spinner fa-spin mr-2"></i> Salvando...</> : "Salvar Alterações"}
              </button>
            </div>

          </div>
        </div>
      )}

    </LayoutBase>
  );
}

export default MinhasSolicitacoes;