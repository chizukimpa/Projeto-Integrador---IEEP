import React, { useState } from 'react';
import LayoutBase from '../components/LayoutBase';

function DashboardAdm() {
  const [form, setForm] = useState({ nome: '', email: '', matricula: '', tipo: 'ALUNO' });

  const handleSalvar = (e) => {
    e.preventDefault();
    alert(`Usuário ${form.nome} cadastrado com sucesso!`);
    setForm({ nome: '', email: '', matricula: '', tipo: 'ALUNO' });
  };

  return (
    <LayoutBase tituloPagina="Painel do Administrador">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gov-blue" data-aos="flip-left">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <i className="fas fa-user-plus mr-2 text-gov-blue"></i> Cadastrar Novo Usuário
          </h3>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Nome Completo</label>
              <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">E-mail Institucional</label>
              <input type="email" className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Matrícula</label>
                <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none" value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Tipo de Usuário</label>
                <select className="w-full p-2 border rounded focus:ring-2 focus:ring-gov-blue outline-none" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                  <option value="ALUNO">Aluno</option>
                  <option value="SECRETARIO">Secretário</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-gov-blue text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition shadow-md">
              Salvar Usuário
            </button>
          </form>
        </div>

        {/* INFORMAÇÃO RÁPIDA */}
        <div className="bg-gov-blue text-white p-8 rounded-xl shadow-lg flex flex-col justify-center" data-aos="fade-right">
          <h2 className="text-2xl font-bold mb-4">Gestão de Acessos</h2>
          <p className="opacity-80 leading-relaxed">
            Como Administrador, você é responsável por criar as credenciais de alunos e secretários. 
            Após o cadastro, o usuário poderá acessar o sistema com a senha padrão '123'.
          </p>
        </div>
      </div>
    </LayoutBase>
  );
}

export default DashboardAdm;