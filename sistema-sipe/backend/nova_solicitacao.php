<?php
// backend/nova_solicitacao.php

// Permite que o React (que roda na porta 5173) converse com o PHP (que roda na porta 80)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

// Recebe o JSON enviado pelo formulário do React
$dados = json_decode(file_get_contents("php://input"), true);

// Verifica se os dados mínimos chegaram
if(isset($dados['id_tipo']) && isset($dados['justificativa']) && isset($dados['id_usuario'])) {
    
    try {
        // 1. Gera um número de protocolo automático (Ex: #2026-0089)
        $ano = date("Y");
        $numeroAleatorio = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $protocolo = "#{$ano}-{$numeroAleatorio}";
        
        // 2. Define a prioridade e status inicial conforme o Banco de Dados
        $prioridade = isset($dados['prioridade']) ? $dados['prioridade'] : 'COMUM';
        $status_inicial = 'RECEBIDO';

        // 3. Prepara a query de Inserção na tabela SOLICITACOES
        $stmt = $pdo->prepare("
            INSERT INTO SOLICITACOES 
            (numero_protocolo, id_tipo, justificativa, prioridade, status, USUARIOS_id_usuarios) 
            VALUES 
            (:protocolo, :id_tipo, :justificativa, :prioridade, :status, :id_usuario)
        ");

        // 4. Substitui as variáveis com segurança (Evita SQL Injection)
        $stmt->bindParam(':protocolo', $protocolo);
        $stmt->bindParam(':id_tipo', $dados['id_tipo']);
        $stmt->bindParam(':justificativa', $dados['justificativa']);
        $stmt->bindParam(':prioridade', $prioridade);
        $stmt->bindParam(':status', $status_inicial);
        $stmt->bindParam(':id_usuario', $dados['id_usuario']);

        // 5. Executa no banco de dados
        if($stmt->execute()) {
            echo json_encode([
                "sucesso" => true, 
                "mensagem" => "Protocolo aberto com sucesso!",
                "protocolo" => $protocolo
            ]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Erro ao salvar no banco."]);
        }

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $e->getMessage()]);
    }

} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos enviados pelo formulário."]);
}
?>