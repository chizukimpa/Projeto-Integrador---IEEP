// src/pages/DashboardAluno.jsx
// A tela principal de onde o aluno vai iniciar todo o fluxo do sistema.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutBase from '../components/LayoutBase';

function DashboardAluno() {
  const navigate = useNavigate();
  // Puxa o ID do aluno lá do cachê pra poder "amarrar" o protocolo no nome dele no banco
  const usuario = JSON.parse(localStorage.getItem('usuarioSIPE')) || {};
  
  const [documento, setDocumento] = useState('Histórico Escolar');
  const [prioridade, setPrioridade] = useState('COMUM'); 
  const [mensagem, setMensagem] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Quando o aluno clica em Enviar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    // FormData é o único jeito de mandar string e arquivo físico na mesma requisição pro PHP.
    const formData = new FormData();
    formData.append('id_aluno', usuario.id);
    formData.append('documento', documento);
    formData.append('prioridade', prioridade); 
    formData.append('mensagem_aluno', mensagem);
    
    // Se o cara escolheu um arquivo, a gente "pendura" ele no pacote
    if (arquivo) {
      formData.append('arquivo', arquivo);
    }

    try {
      const response = await fetch('http://localhost/pdgdsa/backend/criar_solicitacao.php', {
        method: 'POST',
        // Dica: Não coloca Content-Type com FormData, o navegador cuida dos boundaries sozinho
        body: formData
      });
      
      const data = await response.json();
      
      if(data.sucesso) {
        alert("Solicitação gerada com sucesso!");
        // Limpa a tela pra evitar que ele mande o mesmo pedido sem querer clicando duas vezes
        setMensagem('');
        setArquivo(null);
        document.getElementById('arquivoInput').value = '';
        // Joga o aluno direto pra tabela pra ele ver o protocolo novo
        navigate('/minhas_solicitacoes');
      } else {
        alert("Ops: " + data.mensagem);
      }
    } catch (error) {
      alert("Servidor PHP não respondeu. Tenta ligar o Apache.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutBase tituloPagina="Nova Solicitação">
      <div className="max-w-3xl mx-auto" data-aos="fade-up">
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gov-blue p-6 text-white border-b border-blue-800">
            <h2 className="text-xl font-bold flex items-center">
              <i className="fas fa-file-signature mr-3"></i> Requerimento Escolar
            </h2>
            <p className="text-xs text-blue-200 mt-1">Preencha os dados abaixo para enviar um novo pedido à secretaria.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Qual documento você precisa?</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue bg-gray-50 text-gray-700 font-bold"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                >
                  <option value="Histórico Escolar">Histórico Escolar</option>
                  <option value="Declaração de Matrícula">Declaração de Matrícula</option>
                  <option value="Certificado de Conclusão">Certificado de Conclusão</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nível de Prioridade</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue bg-gray-50 font-bold"
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                >
                  <option value="COMUM" className="text-gray-700">Comum (Prazo Normal)</option>
                  <option value="URGENTE" className="text-red-600">Urgente (Requer Justificativa)</option>
                </select>
              </div>
            </div>

            <div>
              {/* O placeholder muda dinamicamente pra "cobrar" a justificativa se ele escolher URGENTE */}
              <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem / Justificativa (Opcional)</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue bg-gray-50 text-gray-700 min-h-[100px] resize-y"
                placeholder={prioridade === 'URGENTE' ? "Por favor, justifique a urgência deste pedido..." : "Escreva algum detalhe para o secretário..."}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              ></textarea>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
              <label className="block text-sm font-bold text-gov-blue mb-2">Anexar Arquivo (Opcional)</label>
              <p className="text-[10px] text-gray-500 mb-3">Formatos aceitos: PDF, JPG ou PNG. Máximo 5MB.</p>
              
              <input 
                id="arquivoInput"
                type="file" 
                accept=".pdf, image/jpeg, image/png"
                onChange={(e) => setArquivo(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gov-blue file:text-white hover:file:bg-blue-800 transition cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={enviando}
                className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center ${enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-gov-green hover:bg-green-800 hover:-translate-y-1'}`}
              >
                {enviando ? <><i className="fas fa-spinner fa-spin mr-2"></i> Processando...</> : <><i className="fas fa-paper-plane mr-2"></i> Enviar Solicitação</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </LayoutBase>
  );
}

export default DashboardAluno;