<?php
// backend/listar_todos_usuarios.php
// Usado na Gestão de Acessos pelo Admin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

try {
    // O DATE_FORMAT converte a data de criação já no banco, economizando processamento.
    // Traz ordenado por nome pra ficar mais fácil pro admin achar a pessoa.
    $sql = "SELECT id_usuarios, nome, email, matricula, tipo_usuario, ativo, 
            DATE_FORMAT(data_criacao, '%d/%m/%Y %H:%i') as data_registro 
            FROM usuarios 
            ORDER BY nome ASC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["sucesso" => true, "dados" => $resultados]);

} catch(PDOException $e) {
    echo json_encode(["sucesso" => false, "mensagem" => "Deu ruim na busca: " . $e->getMessage()]);
}
?>