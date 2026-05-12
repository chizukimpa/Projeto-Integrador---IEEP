<?php
// backend/atualizar_status.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);

if(isset($dados['protocolo']) && isset($dados['novo_status'])) {
    
    $protocolo = $dados['protocolo'];
    $novo_status = $dados['novo_status'];

    // Array com os status permitidos pelo seu banco de dados
    $status_permitidos = ['RECEBIDO', 'EM_ANALISE', 'EM-CONFECCAO', 'AGUARDANDO_ASSINATURA', 'DEFERIDO', 'INDEFERIDO', 'FINALIZADO'];

    if(!in_array($novo_status, $status_permitidos)) {
        die(json_encode(["sucesso" => false, "mensagem" => "Status inválido."]));
    }

    try {
        // Atualiza o status buscando pelo número do protocolo (que é UNIQUE no banco)
        $stmt = $pdo->prepare("
            UPDATE SOLICITACOES 
            SET status = :novo_status 
            WHERE numero_protocolo = :protocolo
        ");

        $stmt->bindParam(':novo_status', $novo_status);
        $stmt->bindParam(':protocolo', $protocolo);

        if($stmt->execute()) {
            // Verifica se alguma linha foi realmente alterada
            if($stmt->rowCount() > 0) {
                echo json_encode(["sucesso" => true, "mensagem" => "Status atualizado com sucesso!"]);
            } else {
                echo json_encode(["sucesso" => false, "mensagem" => "Protocolo não encontrado ou status já era este."]);
            }
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar no banco."]);
        }

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $e->getMessage()]);
    }

} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}
?>