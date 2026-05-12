import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Login() {
  const [screen, setScreen] = useState('login'); // login, recover
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => { AOS.init({ duration: 500 }); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/validar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      
      if (data.sucesso) {
        // --- SUGESTÃO 2 APLICADA AQUI ---
        // Salva os dados de quem logou no "cofre" do navegador
        localStorage.setItem('usuarioSIPE', JSON.stringify({
          nome: data.nome,
          rota: data.rota
        }));
        
        // Redireciona para o Dashboard
        window.location.href = data.rota;
      } else {
        setErro(data.mensagem);
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="bg-gov-light min-h-screen flex flex-col justify-center items-center p-4 font-sans">
      
      {/* Header Atualizado para SIPE */}
      <div className="text-center mb-8" data-aos="fade-down">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-gov-blue mx-auto mb-4 shadow-md">
          <i className="fas fa-landmark text-gov-blue text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-gov-blue tracking-tight">Portal Digital Escolar</h1>
        <p className="text-sm text-gray-600 mt-1">SIPE - Sistema de Protocolo Escolar</p>
      </div>

      <main className="w-full max-w-md bg-white rounded-xl shadow-2xl border-t-4 border-gov-green overflow-hidden" data-aos="zoom-in">
        
        {/* TELA DE LOGIN */}
        {screen === 'login' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acessar o Sistema</h2>
            {erro && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm font-bold border-l-4 border-red-600">{erro}</div>}
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">E-mail Institucional</label>
                <input className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gov-blue outline-none" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
                <input className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gov-blue outline-none" type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} required />
              </div>
              <button className="w-full bg-gov-blue hover:bg-blue-900 text-white font-bold py-3 rounded transition shadow-md">Entrar</button>
            </form>

            <div className="mt-6 text-center text-sm border-t border-gray-200 pt-4">
              <button onClick={()=>setScreen('recover')} className="text-gov-blue hover:underline font-medium">Esqueci minha senha</button>
            </div>
          </div>
        )}

        {/* TELA DE RECUPERAÇÃO DE SENHA */}
        {screen === 'recover' && (
          <div className="p-8 text-center">
            <button onClick={()=>setScreen('login')} className="text-gov-blue mb-4 flex items-center font-bold">
              <i className="fas fa-arrow-left mr-2"></i> Voltar
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recuperar Acesso</h2>
            <p className="text-gray-600 text-sm">Esta funcionalidade será integrada no Módulo de Gestão de Usuários.</p>
          </div>
        )}
      </main>

      <footer className="mt-8 text-sm text-gray-500 flex items-center space-x-2">
        <i className="fas fa-lock text-gov-green"></i>
        <span>Ambiente Seguro e Criptografado</span>
      </footer>
    </div>
  );
}

export default Login;