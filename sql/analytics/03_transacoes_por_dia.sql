SELECT
    t.data_completa,
    COUNT(*) AS total_transacoes,
    SUM(f.valor) AS valor_total,
    COUNT(*) FILTER (WHERE f.flag_suspeita) AS total_suspeitas
FROM dw.fato_transacoes f
JOIN dw.dim_tempo t ON t.tempo_sk = f.tempo_sk
GROUP BY t.data_completa
ORDER BY t.data_completa;
