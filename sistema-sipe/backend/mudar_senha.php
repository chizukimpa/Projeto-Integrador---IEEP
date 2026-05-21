<?php
// backend/mudar_senha.php
// Funcionalidade extra de segurança pra trocar a senha padrão (CPF)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);

if(isset($dados['id_usuarios']) && isset($dados['senha_atual']) && isset($dados['nova_senha'])) {
    
    $id = $dados['id_usuarios'];
    
    // MD5 é básico, mas dá conta do recado pro projeto
    $senha_atual = md5($dados['senha_atual']);
    $nova_senha = md5($dados['nova_senha']);

    try {
        // Primeiro precisa conferir se o cara sabe a senha antiga mesmo (evita hacker que pegou o pc logado)
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id_usuarios = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if($senha_atual === $usuario['senha']) {
                // Senha confirmada, joga a nova no banco
                $update = $pdo->prepare("UPDATE usuarios SET senha = :nova_senha WHERE id_usuarios = :id");
                $update->bindParam(':nova_senha', $nova_senha);
                $update->bindParam(':id', $id);

                if($update->execute()) {
                    echo json_encode(["sucesso" => true, "mensagem" => "Senha secreta atualizada!"]);
                } else {
                    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao persistir a senha."]);
                }
            } else {
                echo json_encode(["sucesso" => false, "mensagem" => "A senha atual está incorreta. Tente novamente."]);
            }
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Sessão de usuário inválida."]);
        }

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro de Banco: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Verifique se digitou todos os campos."]);
}
?>