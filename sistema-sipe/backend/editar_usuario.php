<?php
// Usado na tela de Gestão de Usuários pelo Admin para bloquear/editar usuários
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Desligando os warnings nativos do PHP pq eles tavam poluindo a resposta e quebrando o JSON do React
error_reporting(0); 

require 'conexao.php';
$dados = json_decode(file_get_contents("php://input"), true);

if(isset($dados['id_usuarios']) && isset($dados['nome']) && isset($dados['matricula']) && isset($dados['tipo_usuario'])) {
    
    $id = $dados['id_usuarios'];
    $nome = $dados['nome'];
    $email = isset($dados['email']) ? $dados['email'] : '';
    $matricula = $dados['matricula'];
    $tipo = $dados['tipo_usuario'];
    $ativo = isset($dados['ativo']) ? $dados['ativo'] : 1; 
    
    // Campo opcional pro admin forçar a senha pra virar o CPF da pessoa de novo
    $novo_cpf = isset($dados['novo_cpf']) ? trim($dados['novo_cpf']) : '';

    try {
        // Checa se o email editado não vai conflitar com o de outra pessoa já existente
        if (!empty($email)) {
            $check = $pdo->prepare("SELECT id_usuarios FROM usuarios WHERE email = :email AND id_usuarios != :id");
            $check->execute([':email' => $email, ':id' => $id]);
            if($check->rowCount() > 0) {
                die(json_encode(["sucesso" => false, "mensagem" => "Email já cadastrado para outro aluno/secretário."]));
            }
        }

        // Se o admin clicou no botão de Resetar Senha, o array vem com o novo CPF e eu jogo no banco
        if (!empty($novo_cpf)) {
            $senha_criptografada = md5($novo_cpf);
            $sql = "UPDATE usuarios SET nome = :nome, email = :email, matricula = :matricula, tipo_usuario = :tipo, ativo = :ativo, senha = :senha WHERE id_usuarios = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':senha', $senha_criptografada);
        } else {
            // Update normal sem mexer na senha
            $sql = "UPDATE usuarios SET nome = :nome, email = :email, matricula = :matricula, tipo_usuario = :tipo, ativo = :ativo WHERE id_usuarios = :id";
            $stmt = $pdo->prepare($sql);
        }
        
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':matricula', $matricula);
        $stmt->bindParam(':tipo', $tipo);
        $stmt->bindParam(':ativo', $ativo);
        $stmt->bindParam(':id', $id);

        if($stmt->execute()) {
            echo json_encode(["sucesso" => true, "mensagem" => "Dados atualizados com sucesso!"]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Nenhum dado foi alterado."]);
        }

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Deu erro no MySQL: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Payload incompleto."]);
}
?>