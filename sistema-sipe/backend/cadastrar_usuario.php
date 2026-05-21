<?php
// Arquivo do Admin para cadastrar novos alunos ou secretários no sistema
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);

if(isset($dados['nome']) && isset($dados['email']) && isset($dados['cpf']) && isset($dados['matricula']) && isset($dados['tipo_usuario'])) {
    
    $nome = $dados['nome'];
    $email = $dados['email'];
    $cpf = $dados['cpf'];
    $matricula = $dados['matricula'];
    $tipo = $dados['tipo_usuario'];
    
    // MD5 atende bem a segurança do projeto agora
    $senha_criptografada = md5($cpf);
    
    try {
        // Validando pra não deixar cadastrar e-mail ou matrícula duplicada e quebrar o banco
        $check = $pdo->prepare("SELECT id_usuarios FROM usuarios WHERE email = :email OR matricula = :matricula");
        $check->bindParam(':email', $email);
        $check->bindParam(':matricula', $matricula);
        $check->execute();
        
        if($check->rowCount() > 0) {
            die(json_encode(["sucesso" => false, "mensagem" => "Atenção: Este e-mail ou matrícula já existe no banco."]));
        }

        // Forçando ativo = 1 e pegando a data do momento do cadastro (NOW)
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, tipo_usuario, matricula, ativo, data_criacao) 
                               VALUES (:nome, :email, :senha, :tipo, :matricula, 1, NOW())");
        
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':senha', $senha_criptografada);
        $stmt->bindParam(':tipo', $tipo);
        $stmt->bindParam(':matricula', $matricula);

        if($stmt->execute()) {
            echo json_encode(["sucesso" => true, "mensagem" => "Usuário criado com sucesso!"]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Falha no INSERT do banco de dados."]);
        }

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro de SQL: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Faltam parâmetros no envio."]);
}
?>