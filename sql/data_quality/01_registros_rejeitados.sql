SELECT
    origem,
    motivo,
    COUNT(*) AS total_rejeicoes
FROM auditoria.registros_rejeitados
GROUP BY origem, motivo
ORDER BY total_rejeicoes DESC;
