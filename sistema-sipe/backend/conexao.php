<?php
// backend/conexao.php

// Configurações do Banco de Dados
$host = "localhost";
$dbname = "projeto_integrador";
$username = "root"; // Usuário padrão do XAMPP
$password = "";     // Senha padrão do XAMPP (vazia)

try {
    // Cria a conexão PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // Configura para lançar exceções em caso de erro
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $e) {
    // Caso dê erro de conexão, retorna um JSON avisando o React
    die(json_encode([
        "sucesso" => false,
        "mensagem" => "Erro de conexão com o banco de dados: " . $e->getMessage()
    ]));
}
?>