import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AOS from 'aos';

function LayoutBase({ children, tituloPagina = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  
  const usuarioSalvo = localStorage.getItem('usuarioSIPE');
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : { nome: 'Usuário', rota: '/' };
  const isAluno = usuario.rota === '/dashboard_aluno'; // Verifica se é aluno

  useEffect(() => { 
    AOS.init({ duration: 600 });
    setMenuPerfilAberto(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioSIPE');
    navigate('/');
  };

  const estativa = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      <aside className={`${sidebarAberta ? 'w-72' : 'w-20'} bg-gov-blue text-white flex flex-col transition-all duration-300 shadow-2xl z-30`}>
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
          {/* MUDANÇA AQUI: Nome dinâmico dependendo do tipo de usuário */}
          <Link to={usuario.rota} className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa(usuario.rota) ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
            <i className={`fas ${isAluno ? 'fa-plus-circle' : 'fa-chart-pie'} w-6 text-[15px] ${estativa(usuario.rota) ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
            {sidebarAberta && <span className="ml-2 text-[14px]">{isAluno ? 'Novo Pedido' : 'Dashboard'}</span>}
          </Link>

          {usuario.rota === '/dashboard_adm' ? (
            <Link to="/gerenciar_usuarios" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/gerenciar_usuarios') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
              <i className={`fas fa-users-cog w-6 text-[15px] ${estativa('/gerenciar_usuarios') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
              {sidebarAberta && <span className="ml-2 text-[14px]">Gestão de Usuários</span>}
            </Link>
          ) : (
            <Link to="/minhas_solicitacoes" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${estativa('/minhas_solicitacoes') ? 'bg-white text-gov-blue shadow-md font-bold' : 'hover:bg-white/10 font-medium'}`}>
              <i className={`fas fa-file-invoice w-6 text-[15px] ${estativa('/minhas_solicitacoes') ? '' : 'text-blue-200 group-hover:text-white transition-colors'}`}></i>
              {sidebarAberta && <span className="ml-2 text-[14px]">Solicitações</span>}
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-white shadow-sm h-16 px-8 flex justify-between items-center z-20">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
            {sidebarAberta ? '' : <i className="fas fa-chevron-right text-gray-300 mr-3 text-sm"></i>}
            {tituloPagina}
          </h2>
          
          <div className="relative">
            <button 
              onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
              className="flex items-center space-x-3 p-1.5 hover:bg-gray-50 rounded-lg transition group border border-transparent hover:border-gray-200"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-gov-blue leading-none">{usuario.nome}</p>
                <p className="text-[10px] text-gray-500 flex items-center justify-end mt-1">
                  Minha Conta <i className="fas fa-chevron-down text-[8px] ml-1 opacity-70"></i>
                </p>
              </div>
              <div className="w-8 h-8 bg-gov-green text-white rounded-md flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                {usuario.nome.charAt(0)}
              </div>
            </button>

            {menuPerfilAberto && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-50 mb-1 flex items-center space-x-3">
                   <div className="w-8 h-8 bg-gov-blue/10 text-gov-blue rounded-full flex items-center justify-center font-bold text-sm">
                      {usuario.nome.charAt(0)}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-800 leading-tight">{usuario.nome}</p>
                     <p className="text-[10px] text-gray-500 uppercase mt-0.5">{usuario.rota.replace('/dashboard_', '')}</p>
                   </div>
                </div>
                
                <button onClick={() => navigate('/configuracoes')} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-gov-blue flex items-center transition-colors">
                  <i className="fas fa-user-cog mr-3 text-gray-400 w-4 text-center"></i> Meus Dados
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center font-bold transition-colors">
                  <i className="fas fa-sign-out-alt mr-3 w-4 text-center"></i> Sair do Sistema
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8" key={location.pathname}>
          <div data-aos="fade-up" className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default LayoutBase;