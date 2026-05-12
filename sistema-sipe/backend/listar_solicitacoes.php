<?php
// backend/listar_solicitacoes.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require 'conexao.php';

$id_usuario = isset($_GET['id_usuario']) ? $_GET['id_usuario'] : null;

try {
    // Agora buscamos também o nome do secretário atribuído (se houver)
    $sql = "SELECT s.*, 
                   DATE_FORMAT(s.data_solicitacao, '%d/%m/%Y %H:%i') as dataAbertura,
                   u.nome as requerente, u.matricula,
                   sec.nome as nome_secretario
            FROM SOLICITACOES s
            JOIN USUARIOS u ON s.USUARIOS_id_usuarios = u.id_usuarios
            LEFT JOIN USUARIOS sec ON s.id_secretario_atribuido = sec.id_usuarios";
    
    if ($id_usuario) { $sql .= " WHERE s.USUARIOS_id_usuarios = :id_usuario"; }
    $sql .= " ORDER BY s.data_solicitacao DESC";

    $stmt = $pdo->prepare($sql);
    if ($id_usuario) { $stmt->bindParam(':id_usuario', $id_usuario); }
    $stmt->execute();
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultados as &$linha) {
        // Mapeamento de tipos
        if ($linha['id_tipo'] == 1) $linha['documento'] = 'Histórico Escolar';
        else if ($linha['id_tipo'] == 2) $linha['documento'] = 'Certificado';
        else $linha['documento'] = 'Comprovante de Matrícula';

        $linha['prazo'] = $linha['prazo_final'] ? $linha['prazo_final'] : 'Em processamento';
    }

    echo json_encode(["sucesso" => true, "dados" => $resultados]);
} catch(PDOException $e) {
    echo json_encode(["sucesso" => false, "mensagem" => $e->getMessage()]);
}
?>