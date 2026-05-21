# Projeto Integrador IEEP - Sistema de Solicitação de Documentos Digitais

Bem-vindo ao repositório oficial do Sistema Integrado de Pedidos Escolares (SIPE). 
Este projeto visa digitalizar e otimizar a solicitação de documentos para alunos e servidores.

## Tecnologias e Ferramentas Utilizadas

**Ambiente de Desenvolvimento & Execução:**
* VS Code
* Node.js (gerenciamento de pacotes via NPM)

**Frontend & Identidade Visual:**
* React.js (via Vite)
* Tailwind CSS (estilização)
* AOS (animações)
* Font Awesome (iconografia)
* Google Sans (família tipográfica escolhida para visual limpo e institucional)
* React Router DOM (roteamento SPA para navegação instantânea sem recarregar a tela)
* Recharts (geração de gráficos interativos em SVG para a aba de métricas)

**APIs e Recursos Nativos do Navegador:**
* LocalStorage (gerenciamento de sessão para manter usuários logados de forma segura)
* FormData (interface para empacotamento simultâneo de textos e arquivos físicos, como PDFs, para o backend)

**Backend & Segurança:**
* PHP (arquitetura de API)
* PDO - PHP Data Objects (padrão moderno orientado a objetos para prevenção contra SQL Injection)
* MD5 (algoritmo de hash para mascarar senhas e proteger dados sensíveis no banco)
* Tratamento de CORS (configuração de cabeçalhos para comunicação segura entre a porta do React e a do servidor local)

**Banco de Dados & Servidor Local:**
* XAMPP (Apache e MySQL)
* MySQL Workbench (modelagem e scripts SQL)