SELECT
    a.codigo_agencia,
    a.nome_agencia,
    a.tipo_agencia,
    COUNT(*) AS total_transacoes,
    SUM(f.valor) AS valor_total
FROM dw.fato_transacoes f
JOIN dw.dim_agencia a ON a.agencia_sk = f.agencia_sk
GROUP BY a.codigo_agencia, a.nome_agencia, a.tipo_agencia
ORDER BY valor_total DESC;
