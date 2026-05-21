<?php
// backend/excluir_solicitacao_aluno.php
// Dá o poder pro aluno cancelar um pedido que ele fez errado, mas com travas de segurança
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require 'conexao.php';
$dados = json_decode(file_get_contents("php://input"), true);

if(isset($dados['protocolo'])) {
    $protocolo = $dados['protocolo'];
    
    try {
        // 1. Busca primeiro pra ver se existe, qual o status atual e se tem arquivo anexado
        $check = $pdo->prepare("SELECT status, arquivo_aluno FROM solicitacoes WHERE numero_protocolo = :proto");
        $check->execute([':proto' => $protocolo]);
        $req = $check->fetch(PDO::FETCH_ASSOC);

        if(!$req) {
            die(json_encode(["sucesso" => false, "mensagem" => "Protocolo inexistente."]));
        }

        // Regra de negócio: Não deixa apagar se o secretário já começou a tramitar
        if($req['status'] !== 'RECEBIDO') {
            die(json_encode(["sucesso" => false, "mensagem" => "Não pode excluir, a secretaria já está analisando."]));
        }

        // 2. Limpeza física: Se o aluno tinha anexado um RG ou foto, usa unlink() pra apagar da pasta do servidor e não gastar espaço à toa
        if($req['arquivo_aluno'] && file_exists('uploads/' . $req['arquivo_aluno'])) {
            unlink('uploads/' . $req['arquivo_aluno']);
        }

        // 3. Limpeza no banco: Exclui o registro definitivamente
        $sql = "DELETE FROM solicitacoes WHERE numero_protocolo = :proto";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':proto' => $protocolo]);

        echo json_encode(["sucesso" => true]);

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro de SQL: " . $e->getMessage()]);
    }
}
?>