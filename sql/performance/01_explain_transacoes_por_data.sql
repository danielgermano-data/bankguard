EXPLAIN ANALYZE
SELECT
    data_hora_transacao::date AS data_transacao,
    COUNT(*) AS total_transacoes,
    SUM(valor) AS valor_total
FROM operacional.tabela_transacoes
WHERE data_hora_transacao >= DATE '2026-05-01'
  AND data_hora_transacao < DATE '2026-06-01'
GROUP BY data_hora_transacao::date
ORDER BY data_transacao;
