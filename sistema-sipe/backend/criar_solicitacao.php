<?php
// Endpoint que o Aluno chama para abrir um novo chamado
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'conexao.php';

// Verificando POST direto em vez de JSON por causa do FormData (arquivos)
if(isset($_POST['id_aluno']) && isset($_POST['documento'])) {
    
    $id_usuario = $_POST['id_aluno']; 
    $documento_str = $_POST['documento']; // Recebe a string do select do React
    $prioridade = isset($_POST['prioridade']) ? $_POST['prioridade'] : 'COMUM';
    $nome_arquivo = null;

    // Se o aluno mandar a justificativa vazia, seto um texto padrão pra não violar o NOT NULL do banco
    $justificativa = (isset($_POST['mensagem_aluno']) && trim($_POST['mensagem_aluno']) !== '') 
                     ? trim($_POST['mensagem_aluno']) 
                     : 'Sem justificativa detalhada.';

    // Mapeamento: O banco espera um ID inteiro na tabela solicitacoes (id_tipo), mas o React manda o texto.
    // O id 4 foi removido a pedido da secretaria.
    $id_tipo = 1; // Default
    if($documento_str === 'Declaração de Matrícula') $id_tipo = 2;
    else if($documento_str === 'Certificado de Conclusão') $id_tipo = 3;
    else if($documento_str === 'Outros') $id_tipo = 5;

    // Lógica do Upload físico
    if(isset($_FILES['arquivo']) && $_FILES['arquivo']['error'] === UPLOAD_ERR_OK) {
        $extensao = pathinfo($_FILES['arquivo']['name'], PATHINFO_EXTENSION);
        $nome_arquivo = uniqid() . '_' . time() . '.' . $extensao; // Gerando nome único com timestamp
        $caminho_destino = 'uploads/' . $nome_arquivo;
        
        move_uploaded_file($_FILES['arquivo']['tmp_name'], $caminho_destino);
    }

    try {
        // Gerador de número de protocolo estético pro usuário acompanhar
        $ano = date('Y');
        $numero = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $numero_protocolo = "#{$ano}-{$numero}";
        $status = "RECEBIDO";

        // Inserindo na tabela
        $sql = "INSERT INTO solicitacoes (numero_protocolo, id_tipo, justificativa, prioridade, status, USUARIOS_id_usuarios, arquivo_aluno) 
                VALUES (:numero_protocolo, :id_tipo, :justificativa, :prioridade, :status, :id_usuario, :arquivo_aluno)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':numero_protocolo' => $numero_protocolo,
            ':id_tipo' => $id_tipo,
            ':justificativa' => $justificativa,
            ':prioridade' => $prioridade,
            ':status' => $status,
            ':id_usuario' => $id_usuario,
            ':arquivo_aluno' => $nome_arquivo // Salvando só a string com o nome do arquivo, e não ele inteiro
        ]);

        echo json_encode(["sucesso" => true, "protocolo" => $numero_protocolo]);

    } catch(PDOException $e) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro na inserção: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Parâmetros básicos não enviados."]);
}
?>