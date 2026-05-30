SELECT
    c.cliente_id,
    c.nome_completo,
    COUNT(*) AS total_transacoes,
    SUM(f.valor) AS valor_total,
    AVG(f.valor) AS ticket_medio
FROM dw.fato_transacoes f
JOIN dw.dim_cliente c ON c.cliente_sk = f.cliente_sk
GROUP BY c.cliente_id, c.nome_completo
ORDER BY valor_total DESC;
