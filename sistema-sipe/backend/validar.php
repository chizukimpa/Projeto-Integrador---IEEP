<?php
// backend/validar.php
// Valida login, status e roteia as permissões.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);

if(isset($dados['email']) && isset($dados['senha'])) {
    $email = $dados['email'];
    $senha = $dados['senha'];

    try {
        // Puxando os dados críticos de sessão. Se o 'ativo' for 0, o usuártio tá ban.
        $stmt = $pdo->prepare("SELECT id_usuarios, nome, senha, tipo_usuario, ativo FROM usuarios WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Bate a hash enviada com a hash do banco
            if(md5($senha) === $usuario['senha']) {
                
                // Trava de bloqueio do Admin
                if($usuario['ativo'] == 0) {
                    echo json_encode(["sucesso" => false, "mensagem" => "Seu acesso foi bloqueado pelo Administrador."]);
                    exit; // Mata a execução aqui
                }
                
                // Tratando a string pra não dar erro se alguém salvou 'Admin' ou 'ADMIN' no banco
                $tipo = strtoupper(trim($usuario['tipo_usuario']));
                
                // o React só manda o cara pra página certa pq o PHP fala qual é
                if ($tipo === 'ALUNO') {
                    $rota = '/dashboard_aluno';
                } else if ($tipo === 'ADMIN' || $tipo === 'ADM' || $tipo === 'ADMINISTRADOR') {
                    $rota = '/dashboard_adm';
                } else {
                    $rota = '/dashboard_secretario';
                }

                echo json_encode([
                    "sucesso" => true, 
                    "usuario" => [
                        "id" => $usuario['id_usuarios'],
                        "nome" => $usuario['nome'],
                        "rota" => $rota,
                        "tipo" => $tipo 
                    ]
                ]);
            } else {
                echo json_encode(["sucesso" => false, "mensagem" => "As credenciais não conferem."]);
            }
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Não encontramos sua conta no SIPE."]);
        }

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro de autenticação (BD): " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "E-mail ou senha ausentes na chamada."]);
}
?>