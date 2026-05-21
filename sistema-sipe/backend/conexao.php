<?php
// Arquivo base de conexão com o banco MySQL via PDO
// Incluído em todas as rotas da API

$host = "localhost";
$dbname = "projeto_integrador"; 
$username = "root"; // Usuário padrão local do XAMPP
$password = "";     // Sem senha no ambiente de dev local

try {
    // Definindo o charset utf8 pra não dar problema de acentuação nos nomes
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // Forçando o PDO a jogar exceções (Exceptions) em vez de só dar erro silencioso
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $e) {
    // Se o MySQL do XAMPP estiver desligado, o frontend recebe esse erro bonitinho em JSON
    die(json_encode([
        "sucesso" => false,
        "mensagem" => "Falha ao conectar no banco de dados. Verifica o XAMPP. Erro: " . $e->getMessage()
    ]));
}
?>