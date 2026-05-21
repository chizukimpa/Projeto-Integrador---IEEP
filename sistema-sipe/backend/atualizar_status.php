<?php
// Usado pelo Secretário para tramitar o pedido e enviar a resposta/arquivo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'conexao.php';

// Aqui teve que ser $_POST normal e não json_decode pq estamos recebendo um FormData (por causa do arquivo físico)
if(isset($_POST['protocolo']) && isset($_POST['novo_status'])) {
    
    $protocolo = $_POST['protocolo'];
    $novo_status = $_POST['novo_status'];
    $id_secretario = isset($_POST['id_secretario']) && $_POST['id_secretario'] !== 'null' ? $_POST['id_secretario'] : null;
    $desatribuir = isset($_POST['desatribuir']) && $_POST['desatribuir'] === 'true';
    $mensagem = isset($_POST['mensagem_secretario']) ? trim($_POST['mensagem_secretario']) : null;
    
    // Tratamento do upload do secretário
    $nome_arquivo = null;
    if(isset($_FILES['arquivo_secretario']) && $_FILES['arquivo_secretario']['error'] === UPLOAD_ERR_OK) {
        $extensao = pathinfo($_FILES['arquivo_secretario']['name'], PATHINFO_EXTENSION);
        // Gerando um nome único com sec_ na frente pra não misturar com os arquivos dos alunos
        $nome_arquivo = uniqid('sec_') . '_' . time() . '.' . $extensao;
        move_uploaded_file($_FILES['arquivo_secretario']['tmp_name'], 'uploads/' . $nome_arquivo);
    }

    try {
        // Lógica de "Devolver pra fila"
        if ($desatribuir) {
            $sql = "UPDATE solicitacoes SET status = 'RECEBIDO', id_secretario_atribuido = NULL WHERE numero_protocolo = :protocolo";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':protocolo', $protocolo);
        } else {
            // Se o secretário mandou um arquivo, atualiza o campo de arquivo junto
            if ($nome_arquivo) {
                $sql = "UPDATE solicitacoes SET status = :status, id_secretario_atribuido = :id_sec, mensagem_secretario = :msg, arquivo_secretario = :arq WHERE numero_protocolo = :protocolo";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':arq', $nome_arquivo);
            } else {
                $sql = "UPDATE solicitacoes SET status = :status, id_secretario_atribuido = :id_sec, mensagem_secretario = :msg WHERE numero_protocolo = :protocolo";
                $stmt = $pdo->prepare($sql);
            }
            $stmt->bindParam(':status', $novo_status);
            $stmt->bindParam(':id_sec', $id_secretario);
            $stmt->bindParam(':msg', $mensagem);
            $stmt->bindParam(':protocolo', $protocolo);
        }

        if($stmt->execute()) {
            echo json_encode(["sucesso" => true]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar o status."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro SQL: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados enviados estão incompletos."]);
}
?>