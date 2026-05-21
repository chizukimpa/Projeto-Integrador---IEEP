<?php
// Script para o usuário atualizar os próprios dados no painel
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Adicionado o OPTIONS pra não dar erro nas requisições do React
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Trata requisições OPTIONS do navegador (Preflight). É uma confirmação de segurança que confirma uma requisição, evitando o bloqueio do React
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'conexao.php';

// Recebendo os dados em JSON do body
$dados = json_decode(file_get_contents("php://input"), true);

// Verificando os IDs. Coloquei as duas opções pq o React às vezes manda id_usuarios e as vezes manda só id
if((isset($dados['id_usuarios']) || isset($dados['id'])) && isset($dados['nome'])) {
    
    // Pega o ID de onde ele vier pra não dar pau na query
    $id = isset($dados['id_usuarios']) ? $dados['id_usuarios'] : $dados['id'];
    $nome = $dados['nome'];
    
    // A foto foi removida do escopo
    $foto = isset($dados['foto_perfil']) ? $dados['foto_perfil'] : null;

    try {
        $sql = "UPDATE usuarios SET nome = :nome, foto_perfil = :foto WHERE id_usuarios = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':foto', $foto);
        $stmt->bindParam(':id', $id);

        if($stmt->execute()) {
            echo json_encode(["sucesso" => true, "mensagem" => "Perfil atualizado com sucesso!"]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar no banco."]);
        }

    } catch(PDOException $e) {
        // Capturando erro do banco pra ajudar a debugar
        echo json_encode(["sucesso" => false, "mensagem" => "Erro SQL: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos. Faltando ID ou Nome."]);
}
?>