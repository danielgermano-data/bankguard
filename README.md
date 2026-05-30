# BankGuard

Plataforma de monitoramento e analise de transacoes bancarias.

## Objetivo

O BankGuard simula um ambiente bancario real para demonstrar praticas de Engenharia de Dados aplicadas a transacoes financeiras, qualidade de dados, modelagem relacional, modelagem dimensional, ETL, analytics e exposicao de dados via API REST.

Este projeto esta sendo construido de forma incremental, fase por fase, com foco em um portfolio profissional para vagas de Engenharia de Dados Junior.

## Fases Entregues

### Fase 1: Arquitetura completa do projeto

Entregues:

- Estrutura inicial de diretorios.
- Fluxo de dados da plataforma.
- Tecnologias escolhidas.
- Justificativas tecnicas.
- ADR inicial de arquitetura.

### Fase 2: Modelagem Relacional

Entregues:

- Tabelas operacionais principais.
- Atributos, chaves e regras de integridade.
- Relacionamentos e cardinalidades.
- Diagrama ER em Mermaid.

### MVP Implementado

Entregues:

- DDL PostgreSQL operacional e dimensional.
- Dados CSV simulados.
- Pipeline ETL em Python com validacao de CPF e regras de transacao.
- Auditoria de registros rejeitados.
- API FastAPI com Swagger.
- Consultas SQL analiticas.

## Documentacao Principal

- [Guia iniciante passo a passo](docs/00-guia-iniciante-passo-a-passo.md)
- [Roteiro de tarefas por etapas](docs/03-roteiro-de-tarefas.md)
- [Arquitetura](docs/01-arquitetura.md)
- [Modelagem relacional](docs/02-modelagem-relacional.md)
- [Modelagem dimensional](docs/04-modelagem-dimensional.md)
- [Fluxo de dados em Mermaid](docs/diagrams/fluxo-dados.mmd)
- [Diagrama ER relacional](docs/diagrams/modelo-relacional-er.mmd)
- [ADR 0001](docs/decisions/ADR-0001-arquitetura-inicial.md)

## Roadmap

1. Arquitetura completa do projeto.
2. Modelagem relacional.
3. Modelagem dimensional.
4. Banco PostgreSQL com DDL, indices e constraints.
5. Pipeline ETL em Python.
6. API REST com FastAPI.
7. Consultas SQL analiticas.
8. Qualidade de dados.
9. README profissional e preparo para GitHub.
10. Preparacao para entrevistas tecnicas.

## Tecnologias Planejadas

- Python
- PostgreSQL
- FastAPI
- SQLAlchemy
- Pydantic
- Pandas
- Pytest
- Docker Compose
- Git/GitHub

## Como Executar o MVP

### 1. Subir PostgreSQL

Abra o Docker Desktop antes deste passo.

```bash
docker compose up -d
```

### 2. Criar ambiente Python

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
```

### 3. Executar ETL

```bash
python -m etl.run_pipeline
```

Esse comando:

- Cria os schemas e tabelas.
- Carrega CSVs da pasta `data/raw`.
- Valida CPF e transacoes.
- Registra rejeicoes em `auditoria.registros_rejeitados`.
- Carrega dimensoes e fato no schema `dw`.

### 4. Rodar API

```bash
uvicorn app.main:app --reload
```

Swagger:

```text
http://localhost:8000/docs
```

Endpoints principais:

- `GET /health`
- `GET /clientes`
- `GET /clientes/{cliente_id}`
- `GET /transacoes`
- `GET /transacoes/{transacao_id}`
- `GET /estatisticas`
- `GET /fraudes`

### 5. Rodar testes

```bash
pytest -q
```

### 6. Rodar lint

```bash
ruff check .
```

## Status de Validacao Local

- Compilacao Python: OK.
- Testes automatizados: OK.
- Lint com Ruff: OK.
- API `/health`: OK.
- PostgreSQL/ETL completo: depende do Docker Desktop estar aberto.

## Exemplos de Perguntas de Negocio

- Qual cliente movimentou mais dinheiro?
- Qual agencia teve maior volume financeiro?
- Quantas transacoes foram realizadas por dia?
- Quais transacoes foram classificadas como suspeitas?
- Quais registros foram rejeitados por qualidade de dados?

As consultas estao em `sql/analytics`, `sql/data_quality` e `sql/performance`.
