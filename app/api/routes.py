from typing import Annotated

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import get_connection

router = APIRouter()

LimitParam = Annotated[int, Query(ge=1, le=100)]
OffsetParam = Annotated[int, Query(ge=0)]


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "BankGuard"}


@router.get("/clientes")
def listar_clientes(
    conn: Annotated[psycopg.Connection, Depends(get_connection)],
    limit: LimitParam = 20,
    offset: OffsetParam = 0,
) -> dict[str, object]:
    rows = conn.execute(
        """
        SELECT cliente_id, cpf, nome_completo, email, renda_mensal, score_risco, status_cliente
        FROM operacional.tabela_clientes
        ORDER BY cliente_id
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    ).fetchall()
    total = conn.execute("SELECT COUNT(*) AS total FROM operacional.tabela_clientes").fetchone()
    return {"total": total["total"], "limit": limit, "offset": offset, "items": rows}


@router.get("/clientes/{cliente_id}")
def obter_cliente(
    cliente_id: int,
    conn: Annotated[psycopg.Connection, Depends(get_connection)],
) -> dict[str, object]:
    row = conn.execute(
        """
        SELECT cliente_id, cpf, nome_completo, email, telefone, renda_mensal,
               score_risco, status_cliente, data_cadastro
        FROM operacional.tabela_clientes
        WHERE cliente_id = %s
        """,
        (cliente_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Cliente nao encontrado")

    return row


@router.get("/transacoes")
def listar_transacoes(
    conn: Annotated[psycopg.Connection, Depends(get_connection)],
    limit: LimitParam = 20,
    offset: OffsetParam = 0,
) -> dict[str, object]:
    rows = conn.execute(
        """
        SELECT
            transacao_id, codigo_transacao, conta_origem_id, conta_destino_id,
            tipo_transacao, canal, valor, moeda, data_hora_transacao, status_transacao
        FROM operacional.tabela_transacoes
        ORDER BY data_hora_transacao DESC, transacao_id DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    ).fetchall()
    total = conn.execute("SELECT COUNT(*) AS total FROM operacional.tabela_transacoes").fetchone()
    return {"total": total["total"], "limit": limit, "offset": offset, "items": rows}


@router.get("/transacoes/{transacao_id}")
def obter_transacao(
    transacao_id: int,
    conn: Annotated[psycopg.Connection, Depends(get_connection)],
) -> dict[str, object]:
    row = conn.execute(
        """
        SELECT
            t.transacao_id,
            t.codigo_transacao,
            t.tipo_transacao,
            t.canal,
            t.valor,
            t.moeda,
            t.data_hora_transacao,
            t.status_transacao,
            co.numero_conta AS conta_origem,
            cd.numero_conta AS conta_destino
        FROM operacional.tabela_transacoes t
        LEFT JOIN operacional.tabela_contas co ON co.conta_id = t.conta_origem_id
        LEFT JOIN operacional.tabela_contas cd ON cd.conta_id = t.conta_destino_id
        WHERE t.transacao_id = %s
        """,
        (transacao_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Transacao nao encontrada")

    return row


@router.get("/estatisticas")
def obter_estatisticas(
    conn: Annotated[psycopg.Connection, Depends(get_connection)],
) -> dict[str, object]:
    resumo = conn.execute(
        """
        SELECT
            COUNT(*) AS total_transacoes,
            COALESCE(SUM(valor), 0) AS valor_total,
            COALESCE(AVG(valor), 0) AS ticket_medio,
            COUNT(*) FILTER (WHERE flag_suspeita) AS total_suspeitas
        FROM dw.fato_transacoes
        """
    ).fetchone()

    por_tipo = conn.execute(
        """
        SELECT tipo_transacao, COUNT(*) AS quantidade, SUM(valor) AS valor_total
        FROM dw.fato_transacoes
        GROUP BY tipo_transacao
        ORDER BY valor_total DESC
        """
    ).fetchall()

    return {"resumo": resumo, "por_tipo_transacao": por_tipo}


@router.get("/fraudes")
def listar_fraudes(
    conn: Annotated[psycopg.Connection, Depends(get_connection)],
    limit: LimitParam = 20,
    offset: OffsetParam = 0,
) -> dict[str, object]:
    rows = conn.execute(
        """
        SELECT
            f.transacao_id,
            c.nome_completo,
            f.tipo_transacao,
            f.canal,
            f.valor,
            t.data_completa,
            f.motivo_suspeita
        FROM dw.fato_transacoes f
        JOIN dw.dim_cliente c ON c.cliente_sk = f.cliente_sk
        JOIN dw.dim_tempo t ON t.tempo_sk = f.tempo_sk
        WHERE f.flag_suspeita
        ORDER BY f.valor DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    ).fetchall()
    total = conn.execute(
        "SELECT COUNT(*) AS total FROM dw.fato_transacoes WHERE flag_suspeita"
    ).fetchone()
    return {"total": total["total"], "limit": limit, "offset": offset, "items": rows}
