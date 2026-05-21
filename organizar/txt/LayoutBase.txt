import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import AOS from 'aos'; // Biblioteca pra fazer as animações de surgimento na tela

function LayoutBase({ children, tituloPagina = "Dashboard" }) {
  // Puxa o usuário salvo no cache do navegador. Se não tiver, é pq não fez login.
  const usuarioSalvo = localStorage.getItem('usuarioSIPE');

  // Trava de segurança no Frontend: Se tentar acessar a URL direto sem logar, volta pra Home
  if (!usuarioSalvo) {
    return <Navigate to="/" replace />;
  }

  const usuario = JSON.parse(usuarioSalvo);
  // Descobrindo quem é quem pela rota padrão de cada um
  const isAluno = usuario.rota === '/dashboard_aluno';
  const isAdmin = usuario.rota === '/dashboard_adm';
  const isSecretario = !isAluno && !isAdmin;
  
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);

  // Toda vez que mudar de página (location), fecha o menu e recarrega as animações
  useEffect(() => { 
    AOS.init({ duration: 600 });
    setMenuPerfilAberto(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioSIPE'); // Limpa os dados
    navigate('/', { replace: true }); 
  };

  // --- SISTEMA DE BLOQUEIO POR INATIVIDADE (Deu trabalho mas ficou show de bola) ---
  useEffect(() => {
    let timeoutId;
    
    // Tempo limite setado para 15 minutos (evita que o secretário deixe o PC destravado)
    const tempoLimite = 15 * 60 * 1000; 

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert("Sua sessão expirou por inatividade. Por favor, faça login novamente para sua segurança.");
        handleLogout();
      }, tempoLimite);
    };

    resetTimer();

    // Fica "ouvindo" se o usuário mexe o mouse, clica ou tecla. Se sim, zera o contador de 15 min.
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    // Cleanup: Quando o componente morre, tem que remover os ouvintes pra não dar vazamento de memória (memory leak)
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, []);
  // ------------------------------------------------

  // Funçãozinha pra marcar no menu lateral qual página tá ativa agora
  const estativa = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* SIDEBAR LATERAL DINÂMICA */}
      <aside className={`${sidebarAberta ? 'w-72' : 'w-20'} bg-gov-blue text-white flex flex-col transition-all duration-300 shadow-2xl z-40`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-blue-800/50 mt-2">
          {sidebarAberta && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <i className="fas fa-landmark text-[17px]"></i>
              <span className="font-extrabold text-[18px] tracking-wide">SIPE</span>
            </div>
          )}
          <button onClick={() => setSidebarAberta(!sidebarAberta)} className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
            <i className={`fas ${sidebarAberta ? 'fa-angle-left' : 'fa-bars'} text-[15px]`}></i>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {isAluno && (
            <>
              <Link to="/dashboard_aluno" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/dashboard_aluno') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
                <i className={`fas fa-plus-circle w-6 text-[15px] ${estativa('/dashboard_aluno') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
                {sidebarAberta && <span className="ml-2 text-[14px]">Novo Pedido</span>}
              </Link>
              <Link to="/minhas_solicitacoes" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/minhas_solicitacoes') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
                <i className={`fas fa-file-invoice w-6 text-[15px] ${estativa('/minhas_solicitacoes') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
                {sidebarAberta && <span className="ml-2 text-[14px]">Solicitações</span>}
              </Link>
            </>
          )}

          {isSecretario && (
            <>
              <Link to="/dashboard_secretario" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/dashboard_secretario') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
                <i className={`fas fa-chart-pie w-6 text-[15px] ${estativa('/dashboard_secretario') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
                {sidebarAberta && <span className="ml-2 text-[14px]">Dashboard</span>}
              </Link>
              <Link to="/minhas_solicitacoes" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/minhas_solicitacoes') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
                <i className={`fas fa-inbox w-6 text-[15px] ${estativa('/minhas_solicitacoes') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
                {sidebarAberta && <span className="ml-2 text-[14px]">Caixa de Entrada</span>}
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/dashboard_adm" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/dashboard_adm') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
                <i className={`fas fa-user-plus w-6 text-[15px] ${estativa('/dashboard_adm') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
                {sidebarAberta && <span className="ml-2 text-[14px]">Cadastrar Usuário</span>}
              </Link>
              <Link to="/gestao_usuarios" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/gestao_usuarios') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
                <i className={`fas fa-users-cog w-6 text-[15px] ${estativa('/gestao_usuarios') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
                {sidebarAberta && <span className="ml-2 text-[14px]">Gestão de Acessos</span>}
              </Link>
              <Link to="/metricas_atendimento" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/metricas_atendimento') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
                <i className={`fas fa-chart-line w-6 text-[15px] ${estativa('/metricas_atendimento') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
                {sidebarAberta && <span className="ml-2 text-[14px]">Métricas / Relatórios</span>}
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL E TOPBAR */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-white shadow-sm h-16 px-8 flex justify-between items-center z-30 relative">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
            {tituloPagina}
          </h2>
          
          <div className="relative">
            <button onClick={() => setMenuPerfilAberto(!menuPerfilAberto)} className="flex items-center space-x-3 p-1.5 hover:bg-gray-50 rounded-lg transition group border border-transparent hover:border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-gov-blue leading-none">{usuario.nome}</p>
                <p className="text-[10px] text-gray-500 flex items-center justify-end mt-1">Minha Conta <i className="fas fa-chevron-down text-[8px] ml-1 opacity-70"></i></p>
              </div>
              
              {/* O quadrado verde com a primeira letra do nome. Deixei preparado pra receber imagem se a gente mudar de ideia depois. */}
              <div className="w-8 h-8 rounded-md overflow-hidden shadow-sm">
                {usuario.foto_perfil ? (
                  <img src={usuario.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gov-green text-white flex items-center justify-center font-bold text-sm">
                    {usuario.nome.charAt(0)}
                  </div>
                )}
              </div>

            </button>

            {menuPerfilAberto && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fadeIn">
                <button onClick={() => navigate('/configuracoes')} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                  <i className="fas fa-user-cog mr-3 text-gray-400 w-4 text-center"></i> Meus Dados
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center font-bold transition-colors">
                  <i className="fas fa-sign-out-alt mr-3 w-4 text-center"></i> Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {/* O children aqui é onde as páginas (Dashboard, Minhas Solicitações, etc) vão ser injetadas */}
        <main className="flex-1 overflow-auto p-8 relative z-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default LayoutBase;