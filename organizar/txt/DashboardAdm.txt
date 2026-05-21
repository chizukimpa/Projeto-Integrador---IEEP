// src/pages/DashboardAdm.jsx
// Painel exclusivo do Administrador para registrar as pessoas.
import React, { useState, useEffect } from 'react';
import LayoutBase from '../components/LayoutBase';

function DashboardAdm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [matricula, setMatricula] = useState('');
  const [tipo, setTipo] = useState('ALUNO');
  const [carregando, setCarregando] = useState(false);

  // useEffect): Essa lógica é muito legal. 
  // Enquanto o admin digita o nome, o sistema vai montando o e-mail oficial no padrão do governo.
  // Pega o primeiro e o último nome pra não ficar gigante.
  useEffect(() => {
    const partesNome = nome.trim().toLowerCase().split(' ').filter(p => p.length > 0);
    
    if (partesNome.length >= 2) {
      setEmail(`${partesNome[0]}.${partesNome[partesNome.length - 1]}@sectet.pa.gov.br`);
    } else if (partesNome.length === 1) {
      setEmail(`${partesNome[0]}@sectet.pa.gov.br`);
    } else {
      setEmail('');
    }
  }, [nome]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    
    // Trava de front-end: Evita gastar banda de rede se o cara esqueceu algum campo
    if (!nome || !cpf || !email || !matricula) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    
    setCarregando(true);
    
    try {
      const response = await fetch('http://localhost/pdgdsa/backend/cadastrar_usuario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, cpf, matricula, tipo_usuario: tipo }) 
      });
      
      const data = await response.json();
      
      if (data.sucesso) {
        // Mostra o resumo das credenciais que foram geradas pra o admin copiar e mandar pro aluno
        alert(`Usuário ${nome} cadastrado com sucesso!\n\nLogin: ${email}\nMatrícula: ${matricula}\nSenha: ${cpf}`);
        // Limpa o form pra facilitar o cadastro do próximo aluno
        setNome('');
        setCpf('');
        setMatricula('');
        setTipo('ALUNO');
      } else {
        alert("Erro no banco: " + data.mensagem);
      }
    } catch (error) {
      alert("Erro de requisição com o PHP.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LayoutBase tituloPagina="Painel do Administrador">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gov-blue" data-aos="flip-left">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <i className="fas fa-user-plus mr-2 text-gov-blue"></i> Cadastrar Novo Usuário
          </h3>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Nome Completo</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="Ex: Sophia Khater do Nascimento Gomes"
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                {/* Esse campo é bloqueado pro admin (só leitura), ele se preenche sozinho */}
                <label className="block text-sm font-bold text-gray-700">E-mail (Automático)</label>
                <input 
                  type="email" 
                  className="w-full p-2 border rounded bg-gray-100 text-gray-500 outline-none cursor-not-allowed text-xs" 
                  value={email} 
                  readOnly
                  placeholder="nome.sobrenome@sectet.pa.gov.br"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Matrícula (Sectet)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none" 
                  value={matricula} 
                  onChange={e => setMatricula(e.target.value)} 
                  placeholder="Ex: MAT001"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">CPF (senha)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none font-mono" 
                  value={cpf} 
                  onChange={e => setCpf(e.target.value)} 
                  placeholder="Somente números"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Tipo de Usuário</label>
                <select 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none font-bold text-gray-600" 
                  value={tipo} 
                  onChange={e => setTipo(e.target.value)}
                >
                  <option value="ALUNO">Aluno</option>
                  <option value="SECRETARIO">Secretário</option>
                </select>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={carregando}
              className={`w-full text-white font-bold py-3 rounded-lg transition shadow-md mt-2 ${carregando ? 'bg-gray-400' : 'bg-gov-blue hover:bg-blue-900'}`}
            >
              {carregando ? "Salvando..." : "Salvar Usuário"}
            </button>
          </form>
        </div>

        <div className="bg-gov-blue text-white p-8 rounded-xl shadow-lg flex flex-col justify-center" data-aos="fade-right">
          <h2 className="text-2xl font-bold mb-4">Gestão de Acessos</h2>
          <p className="opacity-80 leading-relaxed mb-6">
            O Administrador é o único com permissão de criar as credenciais de alunos e secretários no SIPE.
          </p>
          <ul className="space-y-3 opacity-90 text-sm">
            <li><i className="fas fa-check-circle mr-2 text-gov-green"></i> O e-mail institucional será gerado automaticamente.</li>
            <li><i className="fas fa-check-circle mr-2 text-gov-green"></i> A senha de acesso será sempre o <strong>CPF</strong> do usuário.</li>
            <li><i className="fas fa-check-circle mr-2 text-gov-green"></i> A matrícula deverá ser preenchida conforme gerada pela SECTET.</li>
          </ul>
        </div>
      </div>
    </LayoutBase>
  );
}

export default DashboardAdm;