<?php
// backend/nova_solicitacao.php
// ATENÇÃO: Acredito que esse arquivo ficou obsoleto depois que migramos pro "criar_solicitacao.php" pra suportar Upload de Arquivos (FormData).
// Mas mantive comentado e funcional caso seja chamado por alguma parte antiga do código.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);

if(isset($dados['id_tipo']) && isset($dados['justificativa']) && isset($dados['id_usuario'])) {
    
    try {
        // Lógica matemática simples pra montar o hash de protocolo visível
        $ano = date("Y");
        $numeroAleatorio = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $protocolo = "#{$ano}-{$numeroAleatorio}";
        
        $prioridade = isset($dados['prioridade']) ? $dados['prioridade'] : 'COMUM';
        $status_inicial = 'RECEBIDO';

        $stmt = $pdo->prepare("
            INSERT INTO solicitacoes 
            (numero_protocolo, id_tipo, justificativa, prioridade, status, USUARIOS_id_usuarios) 
            VALUES 
            (:protocolo, :id_tipo, :justificativa, :prioridade, :status, :id_usuario)
        ");

        $stmt->bindParam(':protocolo', $protocolo);
        $stmt->bindParam(':id_tipo', $dados['id_tipo']);
        $stmt->bindParam(':justificativa', $dados['justificativa']);
        $stmt->bindParam(':prioridade', $prioridade);
        $stmt->bindParam(':status', $status_inicial);
        $stmt->bindParam(':id_usuario', $dados['id_usuario']);

        if($stmt->execute()) {
            echo json_encode([
                "sucesso" => true, 
                "protocolo" => $protocolo
            ]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Erro ao salvar o ticket."]);
        }

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro SQL: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados json incorretos."]);
}
?>