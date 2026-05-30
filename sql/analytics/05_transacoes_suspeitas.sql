SELECT
    f.transacao_id,
    c.nome_completo,
    f.tipo_transacao,
    f.canal,
    f.valor,
    f.motivo_suspeita
FROM dw.fato_transacoes f
JOIN dw.dim_cliente c ON c.cliente_sk = f.cliente_sk
WHERE f.flag_suspeita
ORDER BY f.valor DESC;
