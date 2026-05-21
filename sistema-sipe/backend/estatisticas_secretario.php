<?php
// backend/estatisticas_secretario.php
// Arquivo responsável por alimentar os cards coloridos do Dashboard do Secretário
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'conexao.php';

$id_secretario = isset($_GET['id_secretario']) ? $_GET['id_secretario'] : null;

try {
    // Tive que usar GROUP BY pra contar os status de uma vez só em vez de fazer 8 selects diferentes. Mais otimizado pro banco!
    $sqlCount = "SELECT status, COUNT(*) as total FROM solicitacoes GROUP BY status";
    $stmtCount = $pdo->query($sqlCount);
    // PDO::FETCH_KEY_PAIR transforma o resultado direto num array do tipo ['RECEBIDO' => 10, 'EM_ANALISE' => 5]
    $statusCounts = $stmtCount->fetchAll(PDO::FETCH_KEY_PAIR);

    // Função anônima rápida pra evitar erro de "Undefined index" se um status tiver zerado
    $getQtd = function($status) use ($statusCounts) {
        return isset($statusCounts[$status]) ? (int)$statusCounts[$status] : 0;
    };

    // 1. Fila Global: Conta só o que é RECEBIDO e que ninguém assumiu ainda (id_secretario NULL)
    $sqlNovos = "SELECT COUNT(*) FROM solicitacoes WHERE status = 'RECEBIDO' AND id_secretario_atribuido IS NULL";
    $fila_global = (int) $pdo->query($sqlNovos)->fetchColumn();

    // 2. Minhas Atribuições: Conta TUDO que o secretário em questão pegou pra ele, independente do status
    $minhas = 0;
    if ($id_secretario) {
        $sqlMinhas = "SELECT COUNT(*) FROM solicitacoes WHERE id_secretario_atribuido = :id";
        $stmtMinhas = $pdo->prepare($sqlMinhas);
        $stmtMinhas->execute([':id' => $id_secretario]);
        $minhas = (int) $stmtMinhas->fetchColumn();
    }

    // Monta o pacote JSON exatamente como o React tá esperando ler
    echo json_encode([
        "sucesso" => true,
        "estatisticas" => [
            "fila_global" => $fila_global,
            "atribuidas" => $minhas,
            "recebido" => $getQtd('RECEBIDO'),
            "em_analise" => $getQtd('EM_ANALISE'),
            "em_confeccao" => $getQtd('EM-CONFECCAO'),
            "aguardando_assinatura" => $getQtd('AGUARDANDO_ASSINATURA'),
            "deferido" => $getQtd('DEFERIDO'),
            "indeferido" => $getQtd('INDEFERIDO'),
            "finalizado" => $getQtd('FINALIZADO'),
            "cancelado" => $getQtd('CANCELADO')
        ]
    ]);

} catch(PDOException $e) {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro na contagem: " . $e->getMessage()]);
}
?>