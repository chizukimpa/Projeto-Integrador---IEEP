// src/pages/GestaoUsuarios.jsx
// Tela exclusiva do Admin para ver todo mundo, bloquear quem saiu da escola e arrumar dados.
import React, { useState, useEffect } from 'react';
import LayoutBase from '../components/LayoutBase';

function GestaoUsuarios() {
  const localData = JSON.parse(localStorage.getItem('usuarioSIPE')) || {};

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados de Filtro e Busca (Deu um pouco de trabalho cruzar todos esses filtros, mas funcionou!)
  const [busca, setBusca] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosTipo, setFiltrosTipo] = useState([]);
  const [filtrosStatus, setFiltrosStatus] = useState([]);
  
  // Guardando qual coluna tá ordenando e se é A-Z ou Z-A
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  
  // Estados do Modal de Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/listar_todos_usuarios.php');
      const data = await response.json();
      if (data.sucesso) {
        setUsuarios(data.dados);
      }
    } catch (error) {
      console.error("Erro ao carregar do PHP:", error);
    } finally {
      setCarregando(false);
    }
  };

  const abrirEdicao = (user) => {
    // Clona o usuário pro estado de edição e já deixa o campo de nova senha vazio por padrão
    setUsuarioEditando({ ...user, novo_cpf: '' });
    setModalAberto(true);
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/editar_usuario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioEditando)
      });
      const data = await response.json();
      
      if (data.sucesso) {
        alert("Alterações salvas com sucesso!");
        setModalAberto(false);
        carregarUsuarios(); // Atualiza a tabela pra refletir a mudança
      } else {
        alert("Erro do servidor: " + data.mensagem);
      }
    } catch (error) {
      alert("Falha na comunicação com a API.");
    } finally {
      setSalvando(false);
    }
  };

  // Função genérica de ordenação pra clicar no cabeçalho da tabela
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const limparFiltros = () => {
    setFiltrosTipo([]); 
    setFiltrosStatus([]);
    setMostrarFiltros(false);
  };

  // --- LÓGICA DE PROCESSAMENTO DE DADOS (Frontend) ---
  // Clonando o array pra não mexer no estado original
  let dadosProcessados = [...usuarios];

  // 1. Busca textual global (pesquisa em qualquer campo digitado)
  if (busca) {
    const termo = busca.toLowerCase();
    dadosProcessados = dadosProcessados.filter(u => 
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo) ||
      (u.matricula || '').toLowerCase().includes(termo) ||
      (u.tipo_usuario || '').toLowerCase().includes(termo)
    );
  }

  // 2. Filtros de Checkbox
  if (filtrosTipo.length > 0) {
    dadosProcessados = dadosProcessados.filter(u => filtrosTipo.includes(u.tipo_usuario));
  }
  if (filtrosStatus.length > 0) {
    dadosProcessados = dadosProcessados.filter(u => filtrosStatus.includes(String(u.ativo)));
  }

  // 3. Ordenação A-Z / Z-A
  dadosProcessados.sort((a, b) => {
    let vA = a[sortConfig.key] || '';
    let vB = b[sortConfig.key] || '';
    
    // Transforma em string pra ordenar e evitar quebrar se o banco devolver um NULL
    vA = vA.toString().toLowerCase();
    vB = vB.toString().toLowerCase();

    if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Ícone de setinha pra mostrar se tá subindo ou descendo a ordem
  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <i className="fas fa-sort ml-1 text-gray-300"></i>;
    return <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1 text-gov-blue`}></i>;
  };

  const isEuMesmo = usuarioEditando && String(usuarioEditando.id_usuarios) === String(localData.id);

  return (
    <LayoutBase tituloPagina="Gestão de Acessos">
      
      {/* BARRA DE FERRAMENTAS E BUSCA */}
      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
        <div className="flex items-center space-x-4">
          <h3 className="font-bold text-gray-700 hidden lg:block"><i className="fas fa-users mr-2 text-gov-blue"></i> Base de Usuários</h3>
          
          <div className="relative">
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={`bg-white border px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition ${(filtrosTipo.length > 0 || filtrosStatus.length > 0) ? 'border-gov-blue text-gov-blue bg-blue-50' : 'border-gray-200 text-gray-700'}`}>
              <i className="fas fa-filter mr-2"></i> Filtros
            </button>
            
            {mostrarFiltros && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 animate-fadeIn">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Tipo de Usuário</p>
                <div className="space-y-1 mb-4">
                  {['ALUNO', 'SECRETARIO', 'ADMIN', 'ADMINISTRADOR'].map(t => (
                    <label key={t} className="flex items-center p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-gov-blue" checked={filtrosTipo.includes(t)} onChange={() => setFiltrosTipo(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} /> {t}
                    </label>
                  ))}
                </div>
                
                <div className="border-t pt-3 mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Status da Conta</p>
                  <div className="space-y-1">
                    <label className="flex items-center p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-gov-green" checked={filtrosStatus.includes('1')} onChange={() => setFiltrosStatus(prev => prev.includes('1') ? prev.filter(x => x !== '1') : [...prev, '1'])} /> Ativos
                    </label>
                    <label className="flex items-center p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-red-500" checked={filtrosStatus.includes('0')} onChange={() => setFiltrosStatus(prev => prev.includes('0') ? prev.filter(x => x !== '0') : [...prev, '0'])} /> Bloqueados
                    </label>
                  </div>
                </div>

                <div className="flex justify-between mt-2 pt-3 border-t">
                  <button onClick={limparFiltros} className="text-[11px] font-bold text-red-500 uppercase">Limpar Tudo</button>
                  <button onClick={() => setMostrarFiltros(false)} className="bg-gov-blue text-white px-4 py-1.5 rounded text-[11px] font-bold uppercase shadow-sm">Aplicar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Nome, Matrícula, E-mail ou Cargo..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gov-blue/20 transition" 
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
          />
          <i className="fas fa-search absolute left-3.5 top-2.5 text-gray-400 text-sm"></i>
        </div>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="bg-white rounded-b-xl shadow-xl overflow-hidden border border-gray-100 relative z-10 animate-fadeIn">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('nome')}>Nome Completo <SortIcon col="nome" /></th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('matricula')}>Matrícula <SortIcon col="matricula" /></th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('email')}>E-mail Institucional <SortIcon col="email" /></th>
              <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('tipo_usuario')}>Tipo <SortIcon col="tipo_usuario" /></th>
              <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('ativo')}>Status <SortIcon col="ativo" /></th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {carregando ? (
              <tr><td colSpan="6" className="p-10 text-center"><i className="fas fa-circle-notch fa-spin text-gov-blue text-2xl"></i></td></tr>
            ) : dadosProcessados.length === 0 ? (
              <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Nenhum usuário encontrado.</td></tr>
            ) : (
              dadosProcessados.map((u) => (
                <tr key={u.id_usuarios} className="hover:bg-blue-50/50 transition">
                  <td className="p-4 font-bold text-gray-800">
                    {u.nome}
                    <p className="text-[9px] text-gray-400 font-normal mt-0.5">Criado em: {u.data_registro || 'Data não registrada'}</p>
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-xs">{u.matricula}</td>
                  <td className="p-4 text-gray-500 text-xs">{u.email}</td>
                  <td className="p-4 text-center">
                    {/* Estilo dinâmico pra diferenciar os cargos visualmente */}
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      u.tipo_usuario === 'ADMINISTRADOR' || u.tipo_usuario === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700' 
                        : u.tipo_usuario === 'SECRETARIO' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.tipo_usuario}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {u.ativo == 1 
                      ? <span className="text-gov-green bg-green-50 px-2 py-1 rounded font-bold text-[10px]"><i className="fas fa-check-circle mr-1"></i> Ativo</span>
                      : <span className="text-red-500 bg-red-50 px-2 py-1 rounded font-bold text-[10px]"><i className="fas fa-ban mr-1"></i> Bloqueado</span>
                    }
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => abrirEdicao(u)} className="bg-white border border-gray-200 text-gov-blue hover:bg-gov-blue hover:text-white px-3 py-1.5 rounded transition shadow-sm text-xs font-bold">
                      <i className="fas fa-edit"></i> Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JANELA MODAL DE EDIÇÃO (Corrigido com Scroll da Tela toda pra não cortar) */}
      {modalAberto && usuarioEditando && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-6 pt-10 pb-10 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col relative my-auto h-fit" data-aos="zoom-in">
            
            <div className="bg-gov-blue p-4 sm:p-5 text-white flex justify-between items-center font-bold shrink-0 rounded-t-2xl">
              <h3 className="text-lg"><i className="fas fa-user-edit mr-2"></i> Editar Usuário</h3>
              <button onClick={() => setModalAberto(false)} className="text-blue-200 hover:text-white transition"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <div className="p-5 sm:p-6 space-y-4">
              
              {isEuMesmo && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-[11px] font-bold flex items-center border border-blue-200">
                  <i className="fas fa-shield-alt mr-2 text-lg text-gov-blue"></i>
                  Para sua segurança, não é permitido alterar o próprio cargo ou inativar sua conta por aqui.
                </div>
              )}

              <form id="form-editar" onSubmit={handleSalvarEdicao} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                  <input type="text" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-blue" value={usuarioEditando.nome} onChange={(e) => setUsuarioEditando({...usuarioEditando, nome: e.target.value})} required />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">E-mail Institucional</label>
                  <input type="email" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-blue" value={usuarioEditando.email} onChange={(e) => setUsuarioEditando({...usuarioEditando, email: e.target.value})} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Matrícula</label>
                    <input type="text" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-blue" value={usuarioEditando.matricula} onChange={(e) => setUsuarioEditando({...usuarioEditando, matricula: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Acesso</label>
                    <select 
                      disabled={isEuMesmo} 
                      className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-blue font-bold ${isEuMesmo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-600'}`} 
                      value={usuarioEditando.tipo_usuario} 
                      onChange={(e) => setUsuarioEditando({...usuarioEditando, tipo_usuario: e.target.value})}
                    >
                      <option value="ALUNO">Aluno</option>
                      <option value="SECRETARIO">Secretário</option>
                      <option value="ADMINISTRADOR">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                  <label className="block text-sm font-bold text-orange-800 mb-1">Corrigir CPF (Nova Senha)</label>
                  <p className="text-[10px] text-orange-600 mb-2 leading-tight">Preencha apenas se precisar redefinir a senha do usuário. Deixe em branco para não alterar.</p>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-400 font-mono text-sm" 
                    placeholder="Deixe em branco para manter a atual" 
                    value={usuarioEditando.novo_cpf} 
                    onChange={(e) => setUsuarioEditando({...usuarioEditando, novo_cpf: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status da Conta</label>
                  <select 
                    disabled={isEuMesmo}
                    className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-blue font-bold ${isEuMesmo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} 
                    value={usuarioEditando.ativo} 
                    onChange={(e) => setUsuarioEditando({...usuarioEditando, ativo: parseInt(e.target.value)})}
                  >
                    <option value={1} className="text-gov-green">Liberado (Ativo)</option>
                    <option value={0} className="text-red-500">Bloqueado (Inativo)</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-4 sm:p-5 bg-gray-50 border-t flex justify-end space-x-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setModalAberto(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
              <button type="submit" form="form-editar" disabled={salvando} className={`text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition ${salvando ? 'bg-gray-400' : 'bg-gov-green hover:bg-green-800'}`}>
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </LayoutBase>
  );
}

export default GestaoUsuarios;