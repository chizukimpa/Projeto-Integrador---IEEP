// src/pages/Login.jsx
// Onde tudo começa! Consome a API validar.php pra checar credenciais.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => { 
    // Inicia a animação assim que a tela abre
    AOS.init({ duration: 500 }); 
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); // Previne a tela de dar refresh (padrão de formulário HTML)
    setErro(''); // Limpa mensagens de erro antigas antes de tentar de novo
    setCarregando(true);
    
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/validar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      
      if (data.sucesso) {
        // Guarda os dados de quem tá logando no LocalStorage pra gente não ter que ficar perguntando pro banco quem é ele em toda tela
        localStorage.setItem('usuarioSIPE', JSON.stringify(data.usuario));
        // Manda o cara pra rota que o PHP disse que ele tem permissão
        navigate(data.usuario.rota, { replace: true });
      } else {
        setErro(data.mensagem);
      }
    } catch (err) {
      // Se o XAMPP tiver desligado ou o banco cair, cai aqui pra não estourar erro vermelho na tela
      setErro('Erro de conexão com o servidor. Verifique o XAMPP e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-gov-light min-h-screen flex flex-col justify-center items-center p-4">
      
      <div className="text-center mb-8" data-aos="fade-down">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-gov-blue mx-auto mb-4 shadow-md">
          <i className="fas fa-landmark text-gov-blue text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-gov-blue tracking-tight">Portal Digital Escolar</h1>
        <p className="text-sm text-gray-600 mt-1">SIPE - Sistema Integrado de Pedidos Escolares</p>
      </div>

      <main className="w-full max-w-md bg-white rounded-xl shadow-2xl border-t-4 border-gov-green overflow-hidden" data-aos="zoom-in">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acessar o Sistema</h2>
          
          {/* Caixa de alerta de erro (só aparece se o estado de erro tiver texto) */}
          {erro && (
            <div className="bg-red-50 text-red-700 p-3 mb-5 rounded-lg text-sm font-bold border border-red-200 flex items-center">
              <i className="fas fa-exclamation-circle mr-2 text-lg"></i> {erro}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">E-mail Institucional</label>
              <div className="relative">
                <input 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition" 
                  type="email" 
                  placeholder="Seu e-mail cadastrado"
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required 
                />
                <i className="fas fa-envelope absolute left-3.5 top-3.5 text-gray-400"></i>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Senha de Acesso</label>
              <div className="relative">
                <input 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition font-mono" 
                  type="password" 
                  placeholder="Sua senha secreta (ou CPF)"
                  value={senha} 
                  onChange={(e)=>setSenha(e.target.value)} 
                  required 
                />
                <i className="fas fa-lock absolute left-3.5 top-3.5 text-gray-400"></i>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={carregando}
              className={`w-full text-white font-bold py-3.5 rounded-lg transition-all shadow-md flex justify-center items-center ${carregando ? 'bg-gray-400 cursor-not-allowed' : 'bg-gov-blue hover:bg-blue-900 hover:shadow-lg'}`}
            >
              {carregando ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Autenticando...</> : "Entrar no SIPE"}
            </button>
          </form>
        </div>
      </main>

      <footer className="mt-8 text-xs font-bold text-gray-400 flex items-center space-x-2 tracking-widest">
        <i className="fas fa-shield-alt text-gov-green"></i>
        <span>Ambiente Seguro e Criptografado</span>
      </footer>
    </div>
  );
}

export default Login;