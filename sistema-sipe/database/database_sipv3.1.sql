-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 12/05/2026 às 22:11
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `projeto_integrador`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `aluno_turma`
--

CREATE TABLE `aluno_turma` (
  `USUARIOS_id_usuarios` int(11) NOT NULL,
  `TURMAS_id_turma` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `anexos_solicitacao`
--

CREATE TABLE `anexos_solicitacao` (
  `id_anexos_solicitacao` int(11) NOT NULL,
  `id_solicitacao` int(11) NOT NULL,
  `arquivo` varchar(100) DEFAULT NULL,
  `data_upload` datetime DEFAULT current_timestamp(),
  `SOLICITACOES_id_solicitacao` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes_sistema`
--

CREATE TABLE `configuracoes_sistema` (
  `id_configuracao_sistema` int(11) NOT NULL,
  `prazo_padrao_dias` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos`
--

CREATE TABLE `cursos` (
  `id_cursos` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `documentos_emitidos`
--

CREATE TABLE `documentos_emitidos` (
  `id_documentos_emitidos` int(11) NOT NULL,
  `id_solicitacao` int(11) NOT NULL,
  `id_tipo` int(11) NOT NULL,
  `arquivo` varchar(100) NOT NULL,
  `data_emissão` datetime NOT NULL DEFAULT current_timestamp(),
  `USUARIOS_id_usuarios` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `logs`
--

CREATE TABLE `logs` (
  `id_logs` int(11) NOT NULL,
  `tabela_afetada` varchar(50) NOT NULL,
  `id_registro` int(11) NOT NULL,
  `acao` varchar(20) NOT NULL,
  `descricao` text NOT NULL,
  `data_log` datetime NOT NULL,
  `USUARIOS_id_usuarios` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `movimentacoes`
--

CREATE TABLE `movimentacoes` (
  `id_movimentacoes` int(11) NOT NULL,
  `status` enum('RECEBIDO','EM_ANALISE','EM-CONFECCAO','AGUARDANDO_ASSINATURA','DEFERIDO','INDEFERIDO','FINALIZADO','CANCELADO') NOT NULL,
  `observacao` text NOT NULL,
  `data_movimentacao` datetime NOT NULL DEFAULT current_timestamp(),
  `SOLICITACOES_id_solicitacao` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id_notificacao` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensagem` text NOT NULL,
  `tipo` enum('RECEBIDO','EM_ANALISE','EM-CONFECCAO','AGUARDANDO_ASSINATURA','DEFERIDO','INDEFERIDO','FINALIZADO') NOT NULL,
  `lida` tinyint(4) DEFAULT NULL,
  `data_envio` datetime NOT NULL DEFAULT current_timestamp(),
  `SOLICITACOES_id_solicitacao` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `solicitacoes`
--

CREATE TABLE `solicitacoes` (
  `id_solicitacao` int(11) NOT NULL,
  `numero_protocolo` varchar(20) DEFAULT NULL,
  `id_tipo` int(11) NOT NULL,
  `justificativa` text NOT NULL,
  `prioridade` enum('COMUM','URGENTE') NOT NULL,
  `status` enum('RECEBIDO','EM_ANALISE','EM-CONFECCAO','AGUARDANDO_ASSINATURA','DEFERIDO','INDEFERIDO','FINALIZADO','CANCELADO') NOT NULL,
  `data_solicitacao` datetime DEFAULT current_timestamp(),
  `prazo_final` datetime DEFAULT NULL,
  `data_finalização` datetime DEFAULT NULL,
  `USUARIOS_id_usuarios` int(11) NOT NULL,
  `id_secretario_atribuido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Despejando dados para a tabela `solicitacoes`
--

INSERT INTO `solicitacoes` (`id_solicitacao`, `numero_protocolo`, `id_tipo`, `justificativa`, `prioridade`, `status`, `data_solicitacao`, `prazo_final`, `data_finalização`, `USUARIOS_id_usuarios`, `id_secretario_atribuido`) VALUES
(1, '#2026-2188', 1, 'preciso porque sim', 'COMUM', 'RECEBIDO', '2026-05-12 15:21:30', NULL, NULL, 1, NULL),
(2, '#2026-8306', 2, 'ME MANDA LOGO!', 'URGENTE', 'RECEBIDO', '2026-05-12 15:21:39', NULL, NULL, 1, NULL),
(3, '#2026-5832', 1, 'sim eu quero', 'COMUM', 'RECEBIDO', '2026-05-12 15:23:30', NULL, NULL, 1, NULL),
(4, '#2026-0616', 2, 'QUERO MUITO', 'URGENTE', 'RECEBIDO', '2026-05-12 15:23:39', NULL, NULL, 1, NULL),
(5, '#2026-2504', 1, 'siiik,', 'COMUM', 'RECEBIDO', '2026-05-12 15:28:19', NULL, NULL, 1, NULL),
(6, '#2026-9451', 1, 'asssa', 'COMUM', 'RECEBIDO', '2026-05-12 15:36:37', NULL, NULL, 1, NULL),
(7, '#2026-6937', 1, 'asassa', 'URGENTE', 'RECEBIDO', '2026-05-12 15:36:41', NULL, NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `turmas`
--

CREATE TABLE `turmas` (
  `id_turma` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `id_curso` int(11) NOT NULL,
  `turno` enum('MANHA','TARDE','NOITE') NOT NULL,
  `aluno-turma_idaluno-turma` int(11) NOT NULL,
  `CURSOS_id_cursos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuarios` int(11) NOT NULL,
  `nome` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `tipo_usuario` enum('ALUNO','SECRETARIO','ADMINISTRADOR') NOT NULL,
  `ativo` tinyint(4) NOT NULL,
  `data_criacao` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id_usuarios`, `nome`, `email`, `senha`, `matricula`, `tipo_usuario`, `ativo`, `data_criacao`) VALUES
(1, 'Ana Aluna', 'aluno@teste.com', '202cb962ac59075b964b07152d234b70', 'MAT001', 'ALUNO', 1, '2026-05-12 15:05:29'),
(2, 'Silvio Secretario', 'secretario@teste.com', '202cb962ac59075b964b07152d234b70', 'MAT002', 'SECRETARIO', 1, '2026-05-12 15:05:29'),
(3, 'Admin Master', 'admin@teste.com', '202cb962ac59075b964b07152d234b70', 'MAT003', 'ADMINISTRADOR', 1, '2026-05-12 15:05:29');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `aluno_turma`
--
ALTER TABLE `aluno_turma`
  ADD PRIMARY KEY (`USUARIOS_id_usuarios`,`TURMAS_id_turma`),
  ADD KEY `fk_USUARIOS_has_TURMAS_has_USUARIOS_USUARIOS1_idx` (`USUARIOS_id_usuarios`),
  ADD KEY `fk_USUARIOS_has_TURMAS_has_USUARIOS_TURMAS1_idx` (`TURMAS_id_turma`);

--
-- Índices de tabela `anexos_solicitacao`
--
ALTER TABLE `anexos_solicitacao`
  ADD PRIMARY KEY (`id_anexos_solicitacao`,`SOLICITACOES_id_solicitacao`),
  ADD KEY `fk_ANEXOS_SOLICITACAO_SOLICITACOES1_idx` (`SOLICITACOES_id_solicitacao`);

--
-- Índices de tabela `configuracoes_sistema`
--
ALTER TABLE `configuracoes_sistema`
  ADD PRIMARY KEY (`id_configuracao_sistema`);

--
-- Índices de tabela `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id_cursos`);

--
-- Índices de tabela `documentos_emitidos`
--
ALTER TABLE `documentos_emitidos`
  ADD PRIMARY KEY (`id_documentos_emitidos`,`USUARIOS_id_usuarios`),
  ADD KEY `fk_DOCUMENTOS_EMITIDOS_USUARIOS_idx` (`USUARIOS_id_usuarios`);

--
-- Índices de tabela `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id_logs`,`USUARIOS_id_usuarios`),
  ADD KEY `fk_LOGS_USUARIOS1_idx` (`USUARIOS_id_usuarios`);

--
-- Índices de tabela `movimentacoes`
--
ALTER TABLE `movimentacoes`
  ADD PRIMARY KEY (`id_movimentacoes`,`SOLICITACOES_id_solicitacao`),
  ADD KEY `fk_MOVIMENTACOES_SOLICITACOES1_idx` (`SOLICITACOES_id_solicitacao`);

--
-- Índices de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id_notificacao`,`SOLICITACOES_id_solicitacao`),
  ADD KEY `fk_NOTIFICACOES_SOLICITACOES1_idx` (`SOLICITACOES_id_solicitacao`);

--
-- Índices de tabela `solicitacoes`
--
ALTER TABLE `solicitacoes`
  ADD PRIMARY KEY (`id_solicitacao`,`USUARIOS_id_usuarios`),
  ADD UNIQUE KEY `numero_protocolo_UNIQUE` (`numero_protocolo`),
  ADD KEY `fk_SOLICITACOES_USUARIOS1_idx` (`USUARIOS_id_usuarios`),
  ADD KEY `fk_SOLICITACOES_SECRETARIO` (`id_secretario_atribuido`);

--
-- Índices de tabela `turmas`
--
ALTER TABLE `turmas`
  ADD PRIMARY KEY (`id_turma`,`aluno-turma_idaluno-turma`,`CURSOS_id_cursos`),
  ADD UNIQUE KEY `nome_UNIQUE` (`nome`),
  ADD KEY `fk_TURMAS_CURSOS1_idx` (`CURSOS_id_cursos`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuarios`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`),
  ADD UNIQUE KEY `matricula_UNIQUE` (`matricula`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `anexos_solicitacao`
--
ALTER TABLE `anexos_solicitacao`
  MODIFY `id_anexos_solicitacao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `configuracoes_sistema`
--
ALTER TABLE `configuracoes_sistema`
  MODIFY `id_configuracao_sistema` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cursos`
--
ALTER TABLE `cursos`
  MODIFY `id_cursos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `documentos_emitidos`
--
ALTER TABLE `documentos_emitidos`
  MODIFY `id_documentos_emitidos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `logs`
--
ALTER TABLE `logs`
  MODIFY `id_logs` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `movimentacoes`
--
ALTER TABLE `movimentacoes`
  MODIFY `id_movimentacoes` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id_notificacao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `solicitacoes`
--
ALTER TABLE `solicitacoes`
  MODIFY `id_solicitacao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `turmas`
--
ALTER TABLE `turmas`
  MODIFY `id_turma` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `aluno_turma`
--
ALTER TABLE `aluno_turma`
  ADD CONSTRAINT `fk_USUARIOS_has_TURMAS_has_USUARIOS_TURMAS1` FOREIGN KEY (`TURMAS_id_turma`) REFERENCES `turmas` (`id_turma`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_USUARIOS_has_TURMAS_has_USUARIOS_USUARIOS1` FOREIGN KEY (`USUARIOS_id_usuarios`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Restrições para tabelas `anexos_solicitacao`
--
ALTER TABLE `anexos_solicitacao`
  ADD CONSTRAINT `fk_ANEXOS_SOLICITACAO_SOLICITACOES1` FOREIGN KEY (`SOLICITACOES_id_solicitacao`) REFERENCES `solicitacoes` (`id_solicitacao`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Restrições para tabelas `documentos_emitidos`
--
ALTER TABLE `documentos_emitidos`
  ADD CONSTRAINT `fk_DOCUMENTOS_EMITIDOS_USUARIOS` FOREIGN KEY (`USUARIOS_id_usuarios`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Restrições para tabelas `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `fk_LOGS_USUARIOS1` FOREIGN KEY (`USUARIOS_id_usuarios`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Restrições para tabelas `movimentacoes`
--
ALTER TABLE `movimentacoes`
  ADD CONSTRAINT `fk_MOVIMENTACOES_SOLICITACOES1` FOREIGN KEY (`SOLICITACOES_id_solicitacao`) REFERENCES `solicitacoes` (`id_solicitacao`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `fk_NOTIFICACOES_SOLICITACOES1` FOREIGN KEY (`SOLICITACOES_id_solicitacao`) REFERENCES `solicitacoes` (`id_solicitacao`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Restrições para tabelas `solicitacoes`
--
ALTER TABLE `solicitacoes`
  ADD CONSTRAINT `fk_SOLICITACOES_SECRETARIO` FOREIGN KEY (`id_secretario_atribuido`) REFERENCES `usuarios` (`id_usuarios`),
  ADD CONSTRAINT `fk_SOLICITACOES_USUARIOS1` FOREIGN KEY (`USUARIOS_id_usuarios`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Restrições para tabelas `turmas`
--
ALTER TABLE `turmas`
  ADD CONSTRAINT `fk_TURMAS_CURSOS1` FOREIGN KEY (`CURSOS_id_cursos`) REFERENCES `cursos` (`id_cursos`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
