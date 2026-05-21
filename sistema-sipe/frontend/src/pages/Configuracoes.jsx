import React, { useState } from 'react';
import LayoutBase from '../components/LayoutBase';

function Configuracoes() {
  // Pegando os dados do cache pra só pra saber o nome dele
  const localData = JSON.parse(localStorage.getItem('usuarioSIPE')) || {};
  
  const [nome, setNome] = useState(localData.nome || '');
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregandoSenha, setCarregandoSenha] = useState(false);

  // Um IFzinho pra exibir o cargo de forma amigável embaixo do nome na tela
  let cargoDisplay = "Utilizador do Sistema";
  if (localData.tipo === 'ALUNO' || localData.rota === '/dashboard_aluno') cargoDisplay = "Aluno do Sistema SIPE";
  else if (localData.tipo === 'SECRETARIO' || localData.rota === '/dashboard_secretario') cargoDisplay = "Secretário do Sistema SIPE";
  else if (localData.tipo === 'ADMIN' || localData.rota === '/dashboard_adm') cargoDisplay = "Administrador do SIPE";

  // Função pro usuário trocar o nome de exibição
  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setCarregandoPerfil(true);
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/atualizar_perfil.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuarios: localData.id, nome: nome })
      });
      const data = await response.json();
      if (data.sucesso) {
        // Atualiza o LocalStorage também, senão ele teria que deslogar pra ver o nome novo na barra de cima.
        const novoUsuario = { ...localData, nome: nome };
        localStorage.setItem('usuarioSIPE', JSON.stringify(novoUsuario));
        alert("Perfil atualizado com sucesso!");
        window.location.reload(); 
      } else { 
        alert("Erro: " + data.mensagem); 
      }
    } catch (error) { 
      alert("Erro de conexão com o servidor."); 
    } finally { 
      setCarregandoPerfil(false); 
    }
  };

  // Função sensível: Troca de senha
  const handleSalvarSenha = async (e) => {
    e.preventDefault();
    
    // Validações básicas no front pra poupar processamento no back
    if (novaSenha !== confirmarSenha) {
      alert("Erro: A nova senha e a confirmação não são iguais.");
      return;
    }
    if (novaSenha.length < 4) {
      alert("Sua nova senha é muito curta. Digite uma senha mais segura.");
      return;
    }
    
    setCarregandoSenha(true);
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/mudar_senha.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuarios: localData.id, senha_atual: senhaAtual, nova_senha: novaSenha })
      });
      const data = await response.json();
      if (data.sucesso) {
        alert("Senha alterada com sucesso! Use ela no seu próximo acesso.");
        // Limpa os campos pra não deixar a senha lá de bobeira
        setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      } else { 
        alert("Erro: " + data.mensagem); 
      }
    } catch (error) { 
      alert("Erro de conexão com o backend."); 
    } finally { 
      setCarregandoSenha(false); 
    }
  };

  return (
    <LayoutBase tituloPagina="Minha Conta">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6" data-aos="fade-up">
        
        {/* BLOCO 1: DADOS BÁSICOS */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-fit">
          <div className="bg-gov-blue p-8 text-white text-center">
            {/* Círculo verde padrão do perfil */}
            <div className="w-28 h-28 mx-auto bg-gov-green rounded-full border-4 border-white flex items-center justify-center text-4xl font-bold shadow-lg">
              {nome.charAt(0)}
            </div>
            <h2 className="text-xl font-bold mt-4 leading-tight">{nome}</h2>
            <p className="text-[11px] font-bold opacity-70 tracking-widest mt-1">{cargoDisplay}</p>
          </div>

          <form onSubmit={handleSalvarPerfil} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome de Exibição</label>
              <input type="text" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-blue transition" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <button type="submit" disabled={carregandoPerfil} className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${carregandoPerfil ? 'bg-gray-400 cursor-not-allowed' : 'bg-gov-blue hover:bg-blue-800'}`}>
              {carregandoPerfil ? "A Salvar..." : "Atualizar Perfil"}
            </button>
          </form>
        </div>

        {/* BLOCO 2: FORMULÁRIO DE SEGURANÇA */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-fit">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-lg flex items-center"><i className="fas fa-shield-alt text-gov-green mr-2"></i> Segurança e Acesso</h3>
            <p className="text-xs text-gray-500 mt-1">Altere sua senha regularmente para proteger sua conta no SIPE.</p>
          </div>

          <form onSubmit={handleSalvarSenha} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Senha Atual</label>
              <input type="password" placeholder="Digite sua senha atual" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-green transition font-mono" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
            </div>
            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Nova Senha</label>
              <input type="password" placeholder="Crie uma nova senha secreta" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-green transition font-mono" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Nova Senha</label>
              <input type="password" placeholder="Repita a nova senha" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-gov-green transition font-mono" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
            </div>
            <button type="submit" disabled={carregandoSenha} className={`w-full py-3 mt-4 rounded-xl font-bold text-white shadow-md transition-all ${carregandoSenha ? 'bg-gray-400 cursor-not-allowed' : 'bg-gov-green hover:bg-green-800'}`}>
              {carregandoSenha ? "A Validar..." : "Trocar Minha Senha"}
            </button>
          </form>
        </div>

      </div>
    </LayoutBase>
  );
}

export default Configuracoes;