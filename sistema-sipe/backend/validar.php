<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'conexao.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->senha)) {
    $email = $data->email;
    $senha = md5($data->senha);

    // Ajustado para 'tipo_usuario' para o novo banco de dados
    $sql = $pdo->prepare("SELECT nome, tipo_usuario FROM USUARIOS WHERE email = :email AND senha = :senha AND ativo = 1");
    $sql->bindParam(':email', $email);
    $sql->bindParam(':senha', $senha);
    
    if($sql->execute()){
        if($sql->rowCount() > 0){
            $user = $sql->fetch(PDO::FETCH_ASSOC);
            
            // Validação de tipos do ENUM para redirecionamento
            $rota = '';
            switch($user['tipo_usuario']) {
                case 'ALUNO': $rota = '/dashboard_aluno'; break;
                case 'SECRETARIO': $rota = '/dashboard_secretario'; break;
                case 'ADMINISTRADOR': $rota = '/dashboard_adm'; break;
            }

            echo json_encode(["sucesso" => true, "rota" => $rota, "nome" => $user['nome']]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "E-mail ou senha incorretos."]);
        }
    }
}
?>