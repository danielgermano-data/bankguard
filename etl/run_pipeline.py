from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import pandas as pd
import psycopg
from dotenv import load_dotenv

from etl.validators.cpf import is_valid_cpf, only_digits

ROOT_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT_DIR / "data" / "raw"
DDL_DIR = ROOT_DIR / "database" / "ddl"


def get_database_url() -> str:
    load_dotenv(ROOT_DIR / ".env")
    return os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5433/bankguard",
    ).replace("postgresql+psycopg://", "postgresql://")


def normalize_value(value: Any) -> Any:
    if pd.isna(value):
        return None
    return value


def optional_int(value: Any) -> int | None:
    if value is None or pd.isna(value) or str(value).strip() == "":
        return None
    return int(value)


def read_csv(name: str) -> pd.DataFrame:
    return pd.read_csv(RAW_DIR / name, dtype=str).where(pd.notna, None)


def execute_sql_file(conn: psycopg.Connection, path: Path) -> None:
    with path.open("r", encoding="utf-8") as file:
        conn.execute(file.read())


def setup_database(conn: psycopg.Connection) -> None:
    execute_sql_file(conn, DDL_DIR / "001_create_operational_schema.sql")
    execute_sql_file(conn, DDL_DIR / "002_create_dimensional_schema.sql")
    conn.commit()


def reject_record(
    conn: psycopg.Connection,
    origin: str,
    line: int,
    reason: str,
    payload: dict[str, Any],
) -> None:
    conn.execute(
        """
        INSERT INTO auditoria.registros_rejeitados (origem, linha, motivo, payload)
        VALUES (%s, %s, %s, %s::jsonb)
        """,
        (origin, line, reason, json.dumps(payload, default=str)),
    )


def load_clientes(conn: psycopg.Connection) -> set[int]:
    valid_ids: set[int] = set()
    for index, row in read_csv("clientes.csv").iterrows():
        payload = row.to_dict()
        cpf = only_digits(payload.get("cpf"))

        if not is_valid_cpf(cpf):
            reject_record(conn, "clientes.csv", index + 2, "CPF invalido", payload)
            continue

        valid_ids.add(int(payload["cliente_id"]))
        conn.execute(
            """
            INSERT INTO operacional.tabela_clientes (
                cliente_id, cpf, nome_completo, data_nascimento, email, telefone,
                renda_mensal, score_risco, status_cliente, data_cadastro
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (cliente_id) DO NOTHING
            """,
            (
                int(payload["cliente_id"]),
                cpf,
                payload["nome_completo"],
                payload["data_nascimento"],
                normalize_value(payload.get("email")),
                normalize_value(payload.get("telefone")),
                normalize_value(payload.get("renda_mensal")),
                normalize_value(payload.get("score_risco")),
                payload["status_cliente"],
                payload["data_cadastro"],
            ),
        )
    return valid_ids


def load_agencias(conn: psycopg.Connection) -> None:
    for _, row in read_csv("agencias.csv").iterrows():
        payload = row.to_dict()
        conn.execute(
            """
            INSERT INTO operacional.tabela_agencias (
                agencia_id, codigo_agencia, nome_agencia, tipo_agencia,
                endereco, cidade, estado, ativa
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (agencia_id) DO NOTHING
            """,
            (
                int(payload["agencia_id"]),
                payload["codigo_agencia"],
                payload["nome_agencia"],
                payload["tipo_agencia"],
                normalize_value(payload.get("endereco")),
                normalize_value(payload.get("cidade")),
                normalize_value(payload.get("estado")),
                str(payload["ativa"]).lower() == "true",
            ),
        )


def load_produtos(conn: psycopg.Connection) -> None:
    for _, row in read_csv("produtos.csv").iterrows():
        payload = row.to_dict()
        conn.execute(
            """
            INSERT INTO operacional.tabela_produtos (
                produto_id, codigo_produto, nome_produto, categoria_produto, descricao, ativo
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (produto_id) DO NOTHING
            """,
            (
                int(payload["produto_id"]),
                payload["codigo_produto"],
                payload["nome_produto"],
                payload["categoria_produto"],
                normalize_value(payload.get("descricao")),
                str(payload["ativo"]).lower() == "true",
            ),
        )


def load_contas(conn: psycopg.Connection, valid_cliente_ids: set[int]) -> set[int]:
    valid_ids: set[int] = set()
    for index, row in read_csv("contas.csv").iterrows():
        payload = row.to_dict()
        cliente_id = int(payload["cliente_id"])

        if cliente_id not in valid_cliente_ids:
            reject_record(conn, "contas.csv", index + 2, "Cliente inexistente ou invalido", payload)
            continue

        valid_ids.add(int(payload["conta_id"]))
        conn.execute(
            """
            INSERT INTO operacional.tabela_contas (
                conta_id, cliente_id, agencia_id, produto_id, numero_conta, digito_conta,
                saldo_atual, limite_credito, status_conta, data_abertura, data_encerramento
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (conta_id) DO NOTHING
            """,
            (
                int(payload["conta_id"]),
                cliente_id,
                int(payload["agencia_id"]),
                int(payload["produto_id"]),
                payload["numero_conta"],
                payload["digito_conta"],
                payload["saldo_atual"],
                payload["limite_credito"],
                payload["status_conta"],
                payload["data_abertura"],
                normalize_value(payload.get("data_encerramento")),
            ),
        )
    return valid_ids


def load_transacoes(conn: psycopg.Connection, valid_conta_ids: set[int]) -> None:
    for index, row in read_csv("transacoes.csv").iterrows():
        payload = row.to_dict()
        valor = float(payload["valor"])
        origem = optional_int(payload.get("conta_origem_id"))
        destino = optional_int(payload.get("conta_destino_id"))

        if valor <= 0:
            reject_record(conn, "transacoes.csv", index + 2, "Valor da transacao deve ser positivo", payload)
            continue

        if origem is None and destino is None:
            reject_record(conn, "transacoes.csv", index + 2, "Transacao sem conta origem ou destino", payload)
            continue

        if origem is not None and origem not in valid_conta_ids:
            reject_record(conn, "transacoes.csv", index + 2, "Conta origem inexistente", payload)
            continue

        if destino is not None and destino not in valid_conta_ids:
            reject_record(conn, "transacoes.csv", index + 2, "Conta destino inexistente", payload)
            continue

        conn.execute(
            """
            INSERT INTO operacional.tabela_transacoes (
                transacao_id, codigo_transacao, conta_origem_id, conta_destino_id,
                tipo_transacao, canal, valor, moeda, data_hora_transacao, status_transacao,
                codigo_autorizacao, descricao, ip_origem, dispositivo_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (transacao_id) DO NOTHING
            """,
            (
                int(payload["transacao_id"]),
                payload["codigo_transacao"],
                origem,
                destino,
                payload["tipo_transacao"],
                payload["canal"],
                payload["valor"],
                payload["moeda"],
                payload["data_hora_transacao"],
                payload["status_transacao"],
                normalize_value(payload.get("codigo_autorizacao")),
                normalize_value(payload.get("descricao")),
                normalize_value(payload.get("ip_origem")),
                normalize_value(payload.get("dispositivo_id")),
            ),
        )


def load_dimensions(conn: psycopg.Connection) -> None:
    conn.execute(
        """
        INSERT INTO dw.dim_cliente (
            cliente_id, cpf, nome_completo, faixa_renda, faixa_risco, status_cliente
        )
        SELECT
            cliente_id,
            cpf,
            nome_completo,
            CASE
                WHEN renda_mensal < 3000 THEN 'BAIXA'
                WHEN renda_mensal < 10000 THEN 'MEDIA'
                ELSE 'ALTA'
            END,
            CASE
                WHEN score_risco < 30 THEN 'BAIXO'
                WHEN score_risco < 70 THEN 'MEDIO'
                ELSE 'ALTO'
            END,
            status_cliente
        FROM operacional.tabela_clientes
        ON CONFLICT (cliente_id) DO NOTHING
        """
    )
    conn.execute(
        """
        INSERT INTO dw.dim_agencia (
            agencia_id, codigo_agencia, nome_agencia, tipo_agencia, cidade, estado
        )
        SELECT agencia_id, codigo_agencia, nome_agencia, tipo_agencia, cidade, estado
        FROM operacional.tabela_agencias
        ON CONFLICT (agencia_id) DO NOTHING
        """
    )
    conn.execute(
        """
        INSERT INTO dw.dim_produto (produto_id, codigo_produto, nome_produto, categoria_produto)
        SELECT produto_id, codigo_produto, nome_produto, categoria_produto
        FROM operacional.tabela_produtos
        ON CONFLICT (produto_id) DO NOTHING
        """
    )
    conn.execute(
        """
        INSERT INTO dw.dim_conta (conta_id, numero_conta, status_conta, data_abertura)
        SELECT conta_id, numero_conta, status_conta, data_abertura
        FROM operacional.tabela_contas
        ON CONFLICT (conta_id) DO NOTHING
        """
    )
    conn.execute(
        """
        INSERT INTO dw.dim_tempo (tempo_sk, data_completa, ano, mes, dia, nome_mes, trimestre, dia_semana)
        SELECT DISTINCT
            TO_CHAR(data_hora_transacao::date, 'YYYYMMDD')::integer,
            data_hora_transacao::date,
            EXTRACT(YEAR FROM data_hora_transacao)::integer,
            EXTRACT(MONTH FROM data_hora_transacao)::integer,
            EXTRACT(DAY FROM data_hora_transacao)::integer,
            TO_CHAR(data_hora_transacao, 'TMMonth'),
            EXTRACT(QUARTER FROM data_hora_transacao)::integer,
            EXTRACT(ISODOW FROM data_hora_transacao)::integer
        FROM operacional.tabela_transacoes
        ON CONFLICT (tempo_sk) DO NOTHING
        """
    )


def load_fact(conn: psycopg.Connection) -> None:
    conn.execute(
        """
        INSERT INTO dw.fato_transacoes (
            transacao_id, cliente_sk, conta_origem_sk, conta_destino_sk, agencia_sk,
            produto_sk, tempo_sk, tipo_transacao, canal, status_transacao, valor,
            flag_suspeita, motivo_suspeita
        )
        SELECT
            t.transacao_id,
            dc.cliente_sk,
            dco.conta_sk,
            dcd.conta_sk,
            da.agencia_sk,
            dp.produto_sk,
            dt.tempo_sk,
            t.tipo_transacao,
            t.canal,
            t.status_transacao,
            t.valor,
            (
                t.valor >= 20000
                OR (t.valor >= 10000 AND (
                    EXTRACT(HOUR FROM t.data_hora_transacao) >= 22
                    OR EXTRACT(HOUR FROM t.data_hora_transacao) <= 5
                ))
                OR c.status_conta = 'BLOQUEADA'
            ) AS flag_suspeita,
            CASE
                WHEN c.status_conta = 'BLOQUEADA' THEN 'Transacao envolvendo conta bloqueada'
                WHEN t.valor >= 20000 THEN 'Transacao de valor alto'
                WHEN t.valor >= 10000 AND (
                    EXTRACT(HOUR FROM t.data_hora_transacao) >= 22
                    OR EXTRACT(HOUR FROM t.data_hora_transacao) <= 5
                )
                    THEN 'Transacao alta em horario sensivel'
                ELSE NULL
            END AS motivo_suspeita
        FROM operacional.tabela_transacoes t
        LEFT JOIN operacional.tabela_contas c
            ON c.conta_id = COALESCE(t.conta_origem_id, t.conta_destino_id)
        JOIN dw.dim_cliente dc ON dc.cliente_id = c.cliente_id
        LEFT JOIN dw.dim_conta dco ON dco.conta_id = t.conta_origem_id
        LEFT JOIN dw.dim_conta dcd ON dcd.conta_id = t.conta_destino_id
        JOIN dw.dim_agencia da ON da.agencia_id = c.agencia_id
        JOIN dw.dim_produto dp ON dp.produto_id = c.produto_id
        JOIN dw.dim_tempo dt ON dt.data_completa = t.data_hora_transacao::date
        ON CONFLICT (transacao_id) DO NOTHING
        """
    )


def run() -> None:
    with psycopg.connect(get_database_url()) as conn:
        setup_database(conn)
        load_agencias(conn)
        load_produtos(conn)
        valid_cliente_ids = load_clientes(conn)
        valid_conta_ids = load_contas(conn, valid_cliente_ids)
        load_transacoes(conn, valid_conta_ids)
        load_dimensions(conn)
        load_fact(conn)
        conn.commit()


if __name__ == "__main__":
    run()
