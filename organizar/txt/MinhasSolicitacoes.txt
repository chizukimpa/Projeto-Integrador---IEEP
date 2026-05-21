// src/pages/MinhasSolicitacoes.jsx
// Decidi usar a mesma tela para o Aluno e para a Secretaria, 
// renderizando as partes diferentes condicionalmente (isAluno). Isso evitou ter que clonar a tabela toda em dois arquivos.
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LayoutBase from '../components/LayoutBase';

function MinhasSolicitacoes() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegando a sessão do usuário. O ID é vital pra garantir que o aluno só veja as próprias solicitações.
  const localData = JSON.parse(localStorage.getItem('usuarioSIPE')) || {};
  const usuario = {
    nome: localData.nome || 'Usuário',
    rota: localData.rota || '/',
    id: localData.id || 1 
  };
  const isAluno = usuario.rota === '/dashboard_aluno';

  // --- ÁRVORE DE ESTADOS ---
  // Tem bastante estado aqui porque a tela gerencia Tabela, Filtros, Buscas e 2 tipos de Modal.
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('global'); // Só usado pelo Secretário
  
  // Filtros e Pesquisa
  const [busca, setBusca] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tempStatus, setTempStatus] = useState([]);
  const [tempPrioridade, setTempPrioridade] = useState([]);
  const [filtrosAtivosStatus, setFiltrosAtivosStatus] = useState([]);
  const [filtrosAtivosPrioridade, setFiltrosAtivosPrioridade] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'dataAbertura', direction: 'desc' });

  // Estados Compartilhados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  
  // Estados Específicos do Secretário (Tramitação)
  const [novoStatus, setNovoStatus] = useState('');
  const [atribuidoAMim, setAtribuidoAMim] = useState(false);
  const [msgSecretario, setMsgSecretario] = useState('');
  const [arqSecretario, setArqSecretario] = useState(null);

  // Estados Específicos do Aluno (Edição)
  const [msgAlunoEdit, setMsgAlunoEdit] = useState('');
  const [arqAlunoEdit, setArqAlunoEdit] = useState(null);
  const [removerArqAluno, setRemoverArqAluno] = useState(false);

  // EFEITO MÁGICO: Lê parâmetros passados pela rota. 
  // Isso permite que os cards coloridos do Dashboard do Secretário funcionem como atalhos de filtro pra cá.
  useEffect(() => {
    if (location.state) {
      if (location.state.aba) setAbaAtiva(location.state.aba);
      if (location.state.status) setFiltrosAtivosStatus([location.state.status]);
      if (location.state.prioridade) setFiltrosAtivosPrioridade([location.state.prioridade]);
      
      // Limpa o state do location pra não ficar em loop infinito se ele atualizar a página
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Carrega os dados sempre que o ID do usuário mudar (basicamente no load da tela)
  useEffect(() => { carregarDados(); }, [isAluno, usuario.id]);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      // Endpoint dinâmico: Se for aluno, passa o ID pro PHP filtrar. Se não, o PHP traz a base inteira.
      const url = isAluno 
        ? `http://localhost/pdgdsa/backend/listar_solicitacoes.php?id_usuario=${usuario.id}`
        : `http://localhost/pdgdsa/backend/listar_solicitacoes.php`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.sucesso && Array.isArray(data.dados)) setSolicitacoes(data.dados);
      else setSolicitacoes([]);
    } catch (error) { 
      // console.error(error); // Deixei comentado pra produção
      setSolicitacoes([]); 
    } 
    finally { setCarregando(false); }
  };

  // Função para limpar e popular o modal corretamente antes de abrir, dependendo do perfil
  const abrirModal = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    
    if (isAluno) {
      setMsgAlunoEdit(solicitacao.mensagem_aluno || '');
      setArqAlunoEdit(null);
      setRemoverArqAluno(false);
    } else {
      setNovoStatus(solicitacao.status);
      setAtribuidoAMim(false); 
      setMsgSecretario(solicitacao.mensagem_secretario || '');
      setArqSecretario(null);
    }
    setModalAberto(true);
  };

  // AÇÃO DO SECRETÁRIO: Submete a atualização usando FormData pra suportar arquivos
  const handleAtualizarStatus = async (isDesatribuindo = false) => {
    setSalvandoStatus(true);
    const formData = new FormData();
    formData.append('protocolo', solicitacaoSelecionada.protocolo);
    formData.append('novo_status', isDesatribuindo ? 'RECEBIDO' : novoStatus);
    formData.append('id_secretario', (atribuidoAMim || isMeuChamado) ? usuario.id : null);
    formData.append('desatribuir', isDesatribuindo);
    formData.append('mensagem_secretario', msgSecretario);
    
    if (arqSecretario) formData.append('arquivo_secretario', arqSecretario);

    try {
      const response = await fetch('http://localhost/pdgdsa/backend/atualizar_status.php', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.sucesso) {
        setModalAberto(false);
        carregarDados(); // Recarrega a tabela por trás pra mostrar o novo status
        alert(isDesatribuindo ? "Devolvido para a fila global!" : "Alteração salva!");
      } else { alert('Erro: ' + data.mensagem); }
    } catch (error) { alert('Falha na comunicação com o servidor.'); } 
    finally { setSalvandoStatus(false); }
  };

  // AÇÃO DO ALUNO: Submete a edição do pedido (só rola se ainda for 'RECEBIDO')
  const handleEdicaoAluno = async () => {
    setSalvandoStatus(true);
    const formData = new FormData();
    formData.append('protocolo', solicitacaoSelecionada.protocolo);
    formData.append('mensagem_aluno', msgAlunoEdit);
    formData.append('remover_arquivo', removerArqAluno);
    
    if (arqAlunoEdit) formData.append('arquivo', arqAlunoEdit);

    try {
      const response = await fetch('http://localhost/pdgdsa/backend/editar_solicitacao_aluno.php', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.sucesso) {
        setModalAberto(false);
        carregarDados(); 
        alert("Solicitação atualizada com sucesso!");
      } else { alert('Erro: ' + data.mensagem); }
    } catch (error) { alert('Falha na comunicação com a API.'); } 
    finally { setSalvandoStatus(false); }
  };

  // AÇÃO DO ALUNO: Exclusão lógica/física com confirmação
  const handleExcluirSolicitacao = async () => {
    if(!window.confirm("Tem certeza que deseja apagar este pedido? Isso não pode ser desfeito.")) return;
    setSalvandoStatus(true);
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/excluir_solicitacao_aluno.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolo: solicitacaoSelecionada.protocolo })
      });
      const data = await response.json();
      if (data.sucesso) {
        setModalAberto(false);
        carregarDados(); 
        alert("Solicitação apagada com sucesso!");
      } else { alert('Erro: ' + data.mensagem); }
    } catch (error) { alert('Falha na comunicação.'); } 
    finally { setSalvandoStatus(false); }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const limparFiltros = () => {
    setTempStatus([]); setTempPrioridade([]); setFiltrosAtivosStatus([]); setFiltrosAtivosPrioridade([]);
    setMostrarFiltros(false);
  };

  // --- LÓGICA DE PROCESSAMENTO DE DADOS (FRONTEND) ---
  // Decidi fazer os filtros e ordenações direto no React para poupar o banco de dados de receber dezenas de SELECTs.
  let dadosProcessados = [...solicitacoes];

  // Filtro de abas do secretário
  if (!isAluno) {
    if (abaAtiva === 'global') dadosProcessados = dadosProcessados.filter(c => !c.id_secretario_atribuido && c.status !== 'FINALIZADO' && c.status !== 'CANCELADO');
    else if (abaAtiva === 'pessoal') dadosProcessados = dadosProcessados.filter(c => String(c.id_secretario_atribuido) === String(usuario.id));
  }

  // Busca global por texto
  if (busca) {
    const termo = busca.toLowerCase();
    dadosProcessados = dadosProcessados.filter(c => 
      (c.protocolo || '').toLowerCase().includes(termo) || (c.requerente || '').toLowerCase().includes(termo) ||
      (c.documento || '').toLowerCase().includes(termo) || (c.dataAbertura || '').toLowerCase().includes(termo)
    );
  }

  // Filtros de checkbox (Status e Prioridade)
  if (filtrosAtivosStatus.length > 0) dadosProcessados = dadosProcessados.filter(c => filtrosAtivosStatus.includes(c.status));
  if (filtrosAtivosPrioridade.length > 0) dadosProcessados = dadosProcessados.filter(c => filtrosAtivosPrioridade.includes(c.prioridade));

  // Ordenação avançada (Lida com Data BR, Textos e Pesos de Status)
  dadosProcessados.sort((a, b) => {
    // Parse customizado pra data DD/MM/YYYY HH:MM (Senão o JS buga e acha que dia 30/01 vem antes de 01/12)
    const parseDate = (d) => {
      if(!d || d === 'Em processamento') return 0;
      const partes = String(d).split(' ');
      const [dia, mes, ano] = partes[0].split('/');
      const [h, m] = partes[1] ? partes[1].split(':') : [0, 0];
      return new Date(ano, mes - 1, dia, h, m).getTime();
    };
    
    let vA = a[sortConfig.key], vB = b[sortConfig.key];
    
    if (sortConfig.key === 'prazo' || sortConfig.key === 'dataAbertura') { 
      vA = parseDate(vA); vB = parseDate(vB); 
    } 
    else if (sortConfig.key === 'prioridade') { 
      vA = vA === 'URGENTE' ? 2 : 1; vB = vB === 'URGENTE' ? 2 : 1; 
    } 
    else if (sortConfig.key === 'status') {
      // Dando "pesos" pros status pra eles ordenarem numa linha do tempo lógica
      const pesosStatus = { 'RECEBIDO': 1, 'EM_ANALISE': 2, 'DEFERIDO': 3, 'INDEFERIDO': 3, 'EM-CONFECCAO': 4, 'AGUARDANDO_ASSINATURA': 5, 'FINALIZADO': 6, 'CANCELADO': 6 };
      vA = pesosStatus[vA] || 99; vB = pesosStatus[vB] || 99;
    } else { 
      vA = vA ? vA.toString().toLowerCase() : ''; vB = vB ? vB.toString().toLowerCase() : ''; 
    }
    
    if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Função utilitária pras cores das pílulas de status
  const getStatusColor = (s) => {
    const colors = { 
      'RECEBIDO': 'bg-gray-100 text-gray-800 border-gray-300', 'EM_ANALISE': 'bg-yellow-100 text-yellow-800 border-yellow-300', 
      'EM-CONFECCAO': 'bg-blue-100 text-blue-800 border-blue-300', 'AGUARDANDO_ASSINATURA': 'bg-purple-100 text-purple-800 border-purple-300',
      'DEFERIDO': 'bg-teal-100 text-teal-800 border-teal-300', 'FINALIZADO': 'bg-green-100 text-green-800 border-green-300', 
      'INDEFERIDO': 'bg-orange-100 text-orange-800 border-orange-300', 'CANCELADO': 'bg-red-200 text-red-900 border-red-400' 
    };
    return colors[s] || 'bg-gray-100 text-gray-800';
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <i className="fas fa-sort ml-1 text-gray-300"></i>;
    return <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1 text-gov-blue`}></i>;
  };

  // Variáveis auxiliares pro Modal saber quais botões mostrar baseado no Secretário logado
  const isMeuChamado = solicitacaoSelecionada && String(solicitacaoSelecionada.id_secretario_atribuido) === String(usuario.id);
  const isDeOutro = solicitacaoSelecionada && solicitacaoSelecionada.id_secretario_atribuido && !isMeuChamado;
  const isLivre = solicitacaoSelecionada && !solicitacaoSelecionada.id_secretario_atribuido;

  // Função pra pegar o link de download direto da pasta do XAMPP
  const getFileUrl = (filename) => filename ? `http://localhost/pdgdsa/backend/uploads/${filename}` : null;

  return (
    <LayoutBase tituloPagina={isAluno ? "Minhas Solicitações" : "Central de Solicitações"}>
      
      {/* Abas exclusivas do secretário */}
      {!isAluno && (
        <div className="flex space-x-1 mb-4 bg-gray-200/50 p-1 rounded-xl w-fit overflow-x-auto">
          <button onClick={() => {setAbaAtiva('global'); limparFiltros();}} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${abaAtiva === 'global' ? 'bg-white text-gov-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Fila Global</button>
          <button onClick={() => {setAbaAtiva('pessoal'); limparFiltros();}} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${abaAtiva === 'pessoal' ? 'bg-white text-gov-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Minhas Atribuições</button>
          <button onClick={() => {setAbaAtiva('todas'); limparFiltros();}} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${abaAtiva === 'todas' ? 'bg-white text-gov-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Todas as Solicitações</button>
        </div>
      )}

      {/* BARRA DE FERRAMENTAS E FILTROS */}
      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
        <div className="flex space-x-2">
          {isAluno && <button onClick={() => navigate('/dashboard_aluno')} className="bg-gov-blue text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition">Nova Solicitação</button>}
          <div className="relative">
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={`bg-white border px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition ${(filtrosAtivosStatus.length > 0 || filtrosAtivosPrioridade.length > 0) ? 'border-gov-blue text-gov-blue bg-blue-50' : 'border-gray-200 text-gray-700'}`}><i className="fas fa-filter mr-2"></i> Filtros</button>
            
            {/* Popover dos filtros */}
            {mostrarFiltros && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 animate-fadeIn">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Status</p>
                <div className="space-y-1 mb-4">
                  {['RECEBIDO', 'EM_ANALISE', 'EM-CONFECCAO', 'AGUARDANDO_ASSINATURA', 'DEFERIDO', 'INDEFERIDO', 'FINALIZADO', 'CANCELADO'].map(s => (
                    <label key={s} className="flex items-center p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer"><input type="checkbox" className="mr-2 accent-gov-blue" checked={tempStatus.includes(s)} onChange={() => setTempStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} /> {s.replace('_', ' ')}</label>
                  ))}
                </div>
                <div className="border-t pt-3 mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Prioridade</p>
                  <div className="space-y-1">
                    {['COMUM', 'URGENTE'].map(p => (
                      <label key={p} className="flex items-center p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer"><input type="checkbox" className="mr-2 accent-gov-blue" checked={tempPrioridade.includes(p)} onChange={() => setTempPrioridade(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} /> {p}</label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-2 pt-3 border-t">
                  <button onClick={limparFiltros} className="text-[11px] font-bold text-red-500 uppercase">Limpar Tudo</button>
                  <button onClick={() => {setFiltrosAtivosStatus(tempStatus); setFiltrosAtivosPrioridade(tempPrioridade); setMostrarFiltros(false);}} className="bg-gov-blue text-white px-4 py-1.5 rounded text-[11px] font-bold uppercase shadow-sm">Aplicar</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <input type="text" placeholder="Protocolo, Requerente, Documento ou Data..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gov-blue/20 transition" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <i className="fas fa-search absolute left-3.5 top-2.5 text-gray-400 text-sm"></i>
        </div>
      </div>

      {/* TABELA PRINCIPAL */}
      <div className="bg-white rounded-b-xl shadow-xl overflow-hidden border border-gray-100 relative z-10">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('protocolo')}>Protocolo <SortIcon col="protocolo" /></th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('dataAbertura')}>Data / Hora <SortIcon col="dataAbertura" /></th>
              {!isAluno && <th className="p-4 cursor-pointer" onClick={() => handleSort('requerente')}>Requerente <SortIcon col="requerente" /></th>}
              <th className="p-4 cursor-pointer" onClick={() => handleSort('documento')}>Documento <SortIcon col="documento" /></th>
              <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('prioridade')}>Prioridade <SortIcon col="prioridade" /></th>
              <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
              {!isAluno && <th className="p-4">Responsável</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {carregando ? (
              <tr><td colSpan="7" className="p-10 text-center"><i className="fas fa-circle-notch fa-spin text-gov-blue text-2xl"></i></td></tr>
            ) : dadosProcessados.length === 0 ? (
              <tr><td colSpan="7" className="p-10 text-center text-gray-400 italic">Nenhuma solicitação encontrada.</td></tr>
            ) : (
              dadosProcessados.map((c, i) => (
                <tr key={i} onClick={() => abrirModal(c)} className={`hover:bg-blue-50/50 transition cursor-pointer group`}>
                  <td className="p-4 font-mono font-bold text-gov-blue">{c.protocolo}</td>
                  <td className="p-4 text-gray-500 text-xs">{c.dataAbertura}</td>
                  {!isAluno && <td className="p-4"><p className="font-bold text-gray-800 leading-none">{c.requerente}</p><p className="text-[10px] text-gray-400 mt-1">{c.matricula}</p></td>}
                  <td className="p-4 text-gray-600 font-medium">{c.documento}</td>
                  <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold ${c.prioridade === 'URGENTE' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{c.prioridade}</span></td>
                  <td className="p-4 text-center"><span className={`border px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(c.status)}`}>{(c.status || '').replace('_', ' ')}</span></td>
                  {!isAluno && <td className="p-4 text-xs font-medium">{c.nome_secretario ? <span className="text-gov-blue"><i className="fas fa-user-check mr-1"></i> {c.nome_secretario}</span> : <span className="text-gray-400 italic">Livre</span>}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JANELA MODAL BLINDADA (DUPLA FUNÇÃO: ALUNO / SECRETÁRIO) */}
      {/* O overflow-y-auto no container pai garante que a tela inteira role se o modal ficar muito grande */}
      {modalAberto && solicitacaoSelecionada && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex justify-center items-start overflow-y-auto pt-10 pb-10 px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col relative my-auto h-fit" data-aos="zoom-in">
            <div className="bg-gov-blue p-4 sm:p-5 text-white flex justify-between items-center font-bold shrink-0 rounded-t-2xl">
              <h3 className="text-lg">{isAluno ? "Detalhes da Solicitação" : "Gerenciar Solicitação"}</h3>
              <button onClick={() => setModalAberto(false)} className="hover:text-gray-200 transition"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border text-sm">
                <p><span className="font-bold text-gov-blue">{solicitacaoSelecionada.protocolo}</span> {!isAluno && `- ${solicitacaoSelecionada.requerente}`}</p>
                <p className="mt-2 text-gray-500 font-bold uppercase text-[10px]">Doc: {solicitacaoSelecionada.documento}</p>
                <div className="mt-2"><span className={`border px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(solicitacaoSelecionada.status)}`}>{(solicitacaoSelecionada.status || '').replace('_', ' ')}</span></div>
              </div>

              {/* === CONDIÇÃO 1: VISÃO DO ALUNO === */}
              {isAluno ? (
                <>
                  {solicitacaoSelecionada.status === 'RECEBIDO' ? (
                    // Aluno Modo Edição (A secretaria ainda não pegou)
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-[11px] font-bold"><i className="fas fa-info-circle mr-1"></i> Você ainda pode editar sua justificativa ou anexos.</div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sua Justificativa</label>
                        <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gov-blue text-sm outline-none" value={msgAlunoEdit} onChange={(e)=>setMsgAlunoEdit(e.target.value)} rows="3"></textarea>
                      </div>
                      
                      <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Anexos do Pedido</label>
                        {(solicitacaoSelecionada.arquivo_aluno && !removerArqAluno) ? (
                          <div className="flex items-center justify-between bg-white p-2 border rounded text-sm">
                            <span className="text-gov-blue truncate text-xs"><i className="fas fa-file-alt mr-2"></i> Documento Salvo</span>
                            <div className="flex space-x-2">
                              <a href={getFileUrl(solicitacaoSelecionada.arquivo_aluno)} target="_blank" rel="noreferrer" className="text-gov-green hover:text-green-800" title="Ver/Baixar"><i className="fas fa-download"></i></a>
                              <button onClick={() => setRemoverArqAluno(true)} className="text-red-500 hover:text-red-700" title="Remover"><i className="fas fa-trash"></i></button>
                            </div>
                          </div>
                        ) : (
                          <input type="file" onChange={(e)=>setArqAlunoEdit(e.target.files[0])} className="w-full text-xs" />
                        )}
                      </div>
                    </div>
                  ) : (
                    // Aluno Modo Leitura (A secretaria já tramitou/respondeu)
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">O que você enviou</p>
                        <div className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-600">
                          <p className="italic">"{solicitacaoSelecionada.mensagem_aluno || 'Sem justificativa detalhada.'}"</p>
                          {solicitacaoSelecionada.arquivo_aluno && (
                            <a href={getFileUrl(solicitacaoSelecionada.arquivo_aluno)} target="_blank" rel="noreferrer" className="mt-3 inline-block bg-white border px-3 py-1.5 rounded text-xs font-bold text-gov-blue hover:bg-gray-100">
                              <i className="fas fa-paperclip mr-1"></i> Baixar Meu Anexo
                            </a>
                          )}
                        </div>
                      </div>

                      {(solicitacaoSelecionada.mensagem_secretario || solicitacaoSelecionada.arquivo_secretario) && (
                        <div className="border-l-4 border-gov-green bg-green-50/30 p-4 rounded-r-lg">
                          <p className="text-[10px] font-bold text-gov-green uppercase mb-2"><i className="fas fa-comment-dots mr-1"></i> Resposta da Secretaria</p>
                          {solicitacaoSelecionada.mensagem_secretario && <p className="text-sm text-gray-800 mb-3">{solicitacaoSelecionada.mensagem_secretario}</p>}
                          {solicitacaoSelecionada.arquivo_secretario && (
                            <a href={getFileUrl(solicitacaoSelecionada.arquivo_secretario)} target="_blank" rel="noreferrer" className="inline-block bg-gov-green text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800 shadow-sm">
                              <i className="fas fa-download mr-1"></i> Baixar Arquivo da Secretaria
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* === CONDIÇÃO 2: VISÃO DO SECRETÁRIO === */
                <div className="space-y-4 animate-fadeIn">
                  {isDeOutro && <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-800 text-xs font-bold flex items-center"><i className="fas fa-lock mr-2 text-lg"></i> Em andamento com {solicitacaoSelecionada.nome_secretario}.</div>}
                  {isLivre && !atribuidoAMim && (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                      <span className="text-xs text-blue-800 font-bold">Assumir responsabilidade?</span>
                      <button onClick={() => { setAtribuidoAMim(true); setNovoStatus('EM_ANALISE'); }} className="bg-gov-blue text-white text-[10px] px-3 py-1.5 rounded font-bold shadow-sm">Atribuir a mim</button>
                    </div>
                  )}
                  {isMeuChamado && (
                    <div className="flex justify-end mb-2">
                       <button onClick={() => handleAtualizarStatus(true)} className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase flex items-center"><i className="fas fa-undo mr-1"></i> Devolver para Fila Global</button>
                    </div>
                  )}

                  <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-gov-blue uppercase mb-1">Justificativa do Aluno</p>
                    <p className="text-sm text-gray-700 mb-2 italic">"{solicitacaoSelecionada.mensagem_aluno || 'Sem justificativa detalhada.'}"</p>
                    {solicitacaoSelecionada.arquivo_aluno && (
                      <a href={getFileUrl(solicitacaoSelecionada.arquivo_aluno)} target="_blank" rel="noreferrer" className="inline-block bg-white border border-blue-200 px-3 py-1 rounded text-xs font-bold text-gov-blue hover:bg-blue-50">
                        <i className="fas fa-paperclip mr-1"></i> Ver Anexo do Aluno
                      </a>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Atualizar Status</label>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gov-blue outline-none text-sm font-bold text-gray-700" value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} disabled={isDeOutro || (isLivre && !atribuidoAMim)}>
                      <option value="RECEBIDO">Aguardando Início</option>
                      <option value="EM_ANALISE">Em Análise Técnica</option>
                      <option value="DEFERIDO">Deferido (Pedido Aceito)</option>
                      <option value="EM-CONFECCAO">Em Confecção</option>
                      <option value="AGUARDANDO_ASSINATURA">Aguardando Assinatura</option>
                      <option value="INDEFERIDO">Indeferido (Recusado)</option>
                      <option value="CANCELADO">Cancelado</option>
                      <option value="FINALIZADO">Finalizado (Arquivar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mensagem para o Aluno (Opcional)</label>
                    <textarea disabled={isDeOutro || (isLivre && !atribuidoAMim)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gov-blue text-sm outline-none" value={msgSecretario} onChange={(e)=>setMsgSecretario(e.target.value)} rows="2"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Anexar Documento Final (Opcional)</label>
                    {solicitacaoSelecionada.arquivo_secretario && !arqSecretario ? (
                      <div className="flex items-center justify-between bg-gray-50 p-2 border rounded text-sm mb-2">
                        <span className="text-gov-green text-xs"><i className="fas fa-check-circle mr-1"></i> Arquivo já enviado</span>
                        <a href={getFileUrl(solicitacaoSelecionada.arquivo_secretario)} target="_blank" rel="noreferrer" className="text-xs font-bold text-gov-blue hover:underline">Ver</a>
                      </div>
                    ) : null}
                    <input disabled={isDeOutro || (isLivre && !atribuidoAMim)} type="file" onChange={(e)=>setArqSecretario(e.target.files[0])} className="w-full text-xs" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-5 bg-gray-50 border-t flex justify-between items-center shrink-0 rounded-b-2xl">
              {/* Botão de Excluir Pedido - Exclusivo do Aluno */}
              {isAluno && solicitacaoSelecionada.status === 'RECEBIDO' ? (
                <button onClick={handleExcluirSolicitacao} disabled={salvandoStatus} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center transition"><i className="fas fa-trash-alt mr-1"></i> Excluir Pedido</button>
              ) : <div></div>}

              <div className="flex space-x-3">
                <button onClick={() => setModalAberto(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Fechar</button>
                
                {isAluno ? (
                  solicitacaoSelecionada.status === 'RECEBIDO' && (
                    <button onClick={handleEdicaoAluno} disabled={salvandoStatus} className={`text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition ${salvandoStatus ? 'bg-gray-400' : 'bg-gov-green hover:bg-green-800'}`}>
                      {salvandoStatus ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  )
                ) : (
                  !isDeOutro && (
                    <button onClick={() => handleAtualizarStatus(false)} disabled={salvandoStatus || (isLivre && !atribuidoAMim)} className={`text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition ${salvandoStatus ? 'bg-gray-400' : 'bg-gov-green hover:bg-green-800'}`}>
                      {salvandoStatus ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </LayoutBase>
  );
}

export default MinhasSolicitacoes;