<?php
// backend/listar_solicitacoes.php
// O arquivo mais pesado do sistema. Puxa a tabela inteira e faz os JOINs.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Desligando erros nativos do PHP pra não quebrar a listagem do React
error_reporting(0);

require 'conexao.php';

$id_usuario = isset($_GET['id_usuario']) ? $_GET['id_usuario'] : null;

try {
    // Esse SELECT deu trabalho! Precisei usar 2 JOINs na mesma tabela (usuarios)
    // 1 JOIN pra pegar quem pediu (o aluno) e 1 LEFT JOIN pra pegar quem tá atendendo (o secretário, se houver)
    // O "CASE" é o truque pra traduzir o id_tipo (número) pro nome bonito (string) antes de chegar no react
    
    if ($id_usuario) {
        // Busca filtrada (Para o Aluno ver só o dele)
        $sql = "SELECT s.numero_protocolo as protocolo, s.data_solicitacao as dataAbertura, 
                       u.nome as requerente, u.matricula, 
                       CASE s.id_tipo 
                           WHEN 1 THEN 'Histórico Escolar'
                           WHEN 2 THEN 'Declaração de Matrícula'
                           WHEN 3 THEN 'Certificado de Conclusão'
                           ELSE 'Outros' 
                       END as documento, 
                       s.prioridade, s.status, s.id_secretario_atribuido, sec.nome as nome_secretario,
                       s.justificativa as mensagem_aluno, s.arquivo_aluno, s.mensagem_secretario, s.arquivo_secretario
                FROM solicitacoes s
                JOIN usuarios u ON s.USUARIOS_id_usuarios = u.id_usuarios
                LEFT JOIN usuarios sec ON s.id_secretario_atribuido = sec.id_usuarios
                WHERE s.USUARIOS_id_usuarios = :id
                ORDER BY s.data_solicitacao DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id_usuario);
    } else {
        // Busca global (Para a Secretaria ver todos)
        $sql = "SELECT s.numero_protocolo as protocolo, s.data_solicitacao as dataAbertura, 
                       u.nome as requerente, u.matricula, 
                       CASE s.id_tipo 
                           WHEN 1 THEN 'Histórico Escolar'
                           WHEN 2 THEN 'Declaração de Matrícula'
                           WHEN 3 THEN 'Certificado de Conclusão'
                           ELSE 'Outros' 
                       END as documento, 
                       s.prioridade, s.status, s.id_secretario_atribuido, sec.nome as nome_secretario,
                       s.justificativa as mensagem_aluno, s.arquivo_aluno, s.mensagem_secretario, s.arquivo_secretario
                FROM solicitacoes s
                JOIN usuarios u ON s.USUARIOS_id_usuarios = u.id_usuarios
                LEFT JOIN usuarios sec ON s.id_secretario_atribuido = sec.id_usuarios
                ORDER BY s.data_solicitacao DESC";
        $stmt = $pdo->prepare($sql);
    }

    $stmt->execute();
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formata a data e hora do padrão americano pro brasileiro direto no PHP pra poupar o front
    foreach ($dados as &$linha) {
        if ($linha['dataAbertura']) {
            $linha['dataAbertura'] = date('d/m/Y H:i', strtotime($linha['dataAbertura']));
        }
    }

    echo json_encode(["sucesso" => true, "dados" => $dados]);

} catch(PDOException $e) {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro na consulta SQL: " . $e->getMessage()]);
}
?>