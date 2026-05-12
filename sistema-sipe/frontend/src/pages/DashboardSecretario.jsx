import React, { useState } from 'react';
import LayoutBase from '../components/LayoutBase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardSecretario() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard'); 
  const usuario = JSON.parse(localStorage.getItem('usuarioSIPE')) || { nome: 'Secretário' };

  const evolucaoSolicitacoes = [
    { mes: 'Jan', Abertas: 40, Solucionadas: 24, Atrasadas: 4 },
    { mes: 'Fev', Abertas: 30, Solucionadas: 13, Atrasadas: 2 },
    { mes: 'Mar', Abertas: 55, Solucionadas: 38, Atrasadas: 10 },
    { mes: 'Abr', Abertas: 27, Solucionadas: 39, Atrasadas: 5 },
    { mes: 'Mai', Abertas: 18, Solucionadas: 48, Atrasadas: 1 },
  ];

  const statusAtual = [
    { name: 'Recebido', quantidade: 12 },
    { name: 'Em Análise', quantidade: 19 },
    { name: 'Em Confecção', quantidade: 8 },
    { name: 'Deferido', quantidade: 25 },
  ];

  const minhasSolicitacoesProgresso = [
    { id: '#2026-0511', requerente: 'Aluno Silva', doc: 'Histórico Escolar', status: 'Em Análise' },
    { id: '#2026-0824', requerente: 'Maria Souza', doc: 'Comprovante de Matrícula', status: 'Em Confecção' },
  ];

  // MUDANÇA AQUI: Nomes reais simulados na "Visão Global"
  const solicitacoesGrupo = [
    { id: '#2026-1348', requerente: 'Lucas Alves', doc: 'Certificado', status: 'Recebido', responsavel: null },
    { id: '#2026-1352', requerente: 'Ana Clara', doc: 'Histórico Escolar', status: 'Em Análise', responsavel: 'Carlos Mendes' }, // Mostra quem pegou o caso
    { id: '#2026-0568', requerente: 'Pedro Santos', doc: 'Comprovante de Matrícula', status: 'Recebido', responsavel: null },
    { id: '#2026-0777', requerente: 'João Batista', doc: 'Histórico Escolar', status: 'Em Confecção', responsavel: 'Larissa Ferreira' }, // Mostra quem pegou o caso
  ];

  return (
    <LayoutBase tituloPagina="Área de Trabalho">
      
      <div className="flex border-b border-gray-200 mb-6 bg-white px-2 pt-2 rounded-t-xl shadow-sm overflow-x-auto">
        <button 
          onClick={() => setAbaAtiva('dashboard')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${abaAtiva === 'dashboard' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Análise de Dados
        </button>
        <button 
          onClick={() => setAbaAtiva('visao_pessoal')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${abaAtiva === 'visao_pessoal' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Visão Pessoal
        </button>
        <button 
          onClick={() => setAbaAtiva('visao_grupo')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${abaAtiva === 'visao_grupo' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Visão Global do Grupo
        </button>
      </div>

      {abaAtiva === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gov-blue flex items-center justify-between">
              <div><p className="text-xs font-bold text-gray-500 uppercase">Total de Solicitações</p><h3 className="text-3xl font-extrabold text-gray-800">155</h3></div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-gov-blue text-xl"><i className="fas fa-ticket-alt"></i></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
              <div><p className="text-xs font-bold text-gray-500 uppercase">Atrasadas</p><h3 className="text-3xl font-extrabold text-red-600">12</h3></div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-xl"><i className="fas fa-clock"></i></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
              <div><p className="text-xs font-bold text-gray-500 uppercase">Pendentes</p><h3 className="text-3xl font-extrabold text-yellow-600">48</h3></div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 text-xl"><i className="fas fa-pause-circle"></i></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gov-green flex items-center justify-between">
              <div><p className="text-xs font-bold text-gray-500 uppercase">Solucionadas (Mês)</p><h3 className="text-3xl font-extrabold text-green-600">97</h3></div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-gov-green text-xl"><i className="fas fa-check-double"></i></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-wider">Evolução das Solicitações</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoSolicitacoes}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="Abertas" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Solucionadas" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Atrasadas" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-wider">Status Atual da Fila</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusAtual} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} width={100} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="quantidade" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'visao_pessoal' && (
        <div className="grid grid-cols-1 gap-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Solicitações Atribuídas a {usuario.nome}</h3>
              <span className="bg-gov-blue text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{minhasSolicitacoesProgresso.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {minhasSolicitacoesProgresso.map((c, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-red-600">{c.id}</span>
                    <span className="text-[10px] font-bold text-gov-blue bg-blue-50 px-2 rounded-full">{c.status}</span>
                  </div>
                  <p className="font-bold text-sm text-gray-800">{c.requerente}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.doc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'visao_grupo' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Fila Global de Atendimento</h3>
            <span className="bg-gov-blue text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{solicitacoesGrupo.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-400 text-[10px] uppercase font-bold border-b">
                <tr>
                  <th className="p-4">Protocolo</th>
                  <th className="p-4">Requerente</th>
                  <th className="p-4">Documento</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {solicitacoesGrupo.map((c, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition cursor-pointer">
                    <td className="p-4 font-mono font-bold text-red-600 text-xs">{c.id}</td>
                    <td className="p-4 font-bold text-gray-700">{c.requerente}</td>
                    <td className="p-4 text-gray-600">{c.doc}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status === 'Recebido' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium">
                      {c.responsavel ? (
                        <span className="text-gov-blue"><i className="fas fa-user-check mr-1"></i> {c.responsavel}</span>
                      ) : (
                        <span className="text-gray-400 italic">Livre (Não atribuído)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </LayoutBase>
  );
}

export default DashboardSecretario;