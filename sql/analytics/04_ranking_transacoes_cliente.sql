WITH transacoes_rankeadas AS (
    SELECT
        c.nome_completo,
        f.transacao_id,
        f.valor,
        f.tipo_transacao,
        ROW_NUMBER() OVER (
            PARTITION BY c.cliente_id
            ORDER BY f.valor DESC
        ) AS ranking_cliente
    FROM dw.fato_transacoes f
    JOIN dw.dim_cliente c ON c.cliente_sk = f.cliente_sk
)
SELECT *
FROM transacoes_rankeadas
WHERE ranking_cliente <= 3
ORDER BY nome_completo, ranking_cliente;
