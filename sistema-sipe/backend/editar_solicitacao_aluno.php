<?php
// Permite que o Aluno mude o arquivo ou mensagem SE a secretaria ainda não tiver pegado
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

error_reporting(0);
require 'conexao.php';

if(isset($_POST['protocolo'])) {
    $protocolo = $_POST['protocolo'];
    $mensagem = isset($_POST['mensagem_aluno']) && trim($_POST['mensagem_aluno']) !== '' ? trim($_POST['mensagem_aluno']) : 'Sem justificativa detalhada.';
    $remover_arquivo = isset($_POST['remover_arquivo']) && $_POST['remover_arquivo'] === 'true';
    
    try {
        // Trava de segurança: verificando o status atual direto no banco
        $check = $pdo->prepare("SELECT status, arquivo_aluno FROM solicitacoes WHERE numero_protocolo = :proto");
        $check->execute([':proto' => $protocolo]);
        $req = $check->fetch(PDO::FETCH_ASSOC);

        if($req['status'] !== 'RECEBIDO') {
            die(json_encode(["sucesso" => false, "mensagem" => "A secretaria já pegou esse chamado, não pode mais editar."]));
        }

        $nome_arquivo = $req['arquivo_aluno'];

        // Se ele mandou deletar ou tá enviando uma foto nova, eu apago a foto velha da pasta do XAMPP pra não virar lixo
        if($remover_arquivo || (isset($_FILES['arquivo']) && $_FILES['arquivo']['error'] === UPLOAD_ERR_OK)) {
            if($nome_arquivo && file_exists('uploads/' . $nome_arquivo)) {
                unlink('uploads/' . $nome_arquivo);
            }
            $nome_arquivo = null;
        }

        // Fazendo upload da nova versão do anexo
        if(isset($_FILES['arquivo']) && $_FILES['arquivo']['error'] === UPLOAD_ERR_OK) {
            $extensao = pathinfo($_FILES['arquivo']['name'], PATHINFO_EXTENSION);
            $nome_arquivo = uniqid('aluno_') . '_' . time() . '.' . $extensao;
            move_uploaded_file($_FILES['arquivo']['tmp_name'], 'uploads/' . $nome_arquivo);
        }

        $sql = "UPDATE solicitacoes SET justificativa = :msg, arquivo_aluno = :arq WHERE numero_protocolo = :proto";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([ ':msg' => $mensagem, ':arq' => $nome_arquivo, ':proto' => $protocolo ]);

        echo json_encode(["sucesso" => true]);

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro na edição: " . $e->getMessage()]);
    }
}
?>