# BankGuard

[![CI](https://github.com/danieloliveirag29-dot/bankguard/actions/workflows/ci.yml/badge.svg)](https://github.com/danieloliveirag29-dot/bankguard/actions/workflows/ci.yml)

Plataforma de monitoramento e analise de transacoes bancarias.

## Objetivo

O BankGuard simula um ambiente bancario real para demonstrar praticas de Engenharia de Dados aplicadas a transacoes financeiras, qualidade de dados, modelagem relacional, modelagem dimensional, ETL, analytics e exposicao de dados via API REST.

Este projeto esta sendo construido de forma incremental, fase por fase, com foco em um portfolio profissional para vagas de Engenharia de Dados Junior.

## Resumo Para Recrutadores

O BankGuard demonstra um fluxo completo de Engenharia de Dados aplicado a um dominio bancario: ingestao de dados, validacao de qualidade, persistencia em PostgreSQL, carga em modelo dimensional, consultas analiticas e exposicao via API REST com FastAPI.

Competencias demonstradas:

- Modelagem relacional e dimensional.
- SQL com joins, agregacoes, CTEs e window functions.
- ETL em Python com validacoes de qualidade.
- PostgreSQL com schemas, constraints e indices.
- API REST com FastAPI e documentacao Swagger.
- Testes automatizados, lint e CI com GitHub Actions.

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
- [Passo a passo por aplicativos](docs/05-passo-a-passo-apps.md)
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

## Tecnologias Utilizadas

- Python
- PostgreSQL
- FastAPI
- Pydantic
- Pandas
- Pytest
- Docker Compose
- Git/GitHub
- GitHub Actions

## Como Executar o MVP

### 1. Subir PostgreSQL

Abra o Docker Desktop antes deste passo.

```bash
docker compose up -d
```

O PostgreSQL do projeto usa a porta local `5433` para evitar conflito com instalacoes locais do PostgreSQL na porta padrao `5432`.

### 2. Criar ambiente Python

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
```

### 3. Executar ETL

No PowerShell, configure a conexao local com o PostgreSQL do Docker:

```bash
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/bankguard'
```

Depois execute o pipeline:

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
uvicorn app.main:app --port 8001
```

Swagger:

```text
http://127.0.0.1:8001/docs
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
- PostgreSQL conectado via Docker Compose na porta `5433`: OK.
- ETL executado com sucesso: OK.
- Swagger em `http://127.0.0.1:8001/docs`: OK.
- API `/health`: OK.
- API `/clientes`: OK.
- API `/transacoes`: OK.
- API `/transacoes/{transacao_id}`: OK.
- API `/estatisticas`: OK.
- API `/fraudes`: OK.

Resultado validado em `/estatisticas`:

```json
{
  "resumo": {
    "total_transacoes": 8,
    "valor_total": "85721.40",
    "ticket_medio": "10715.17",
    "total_suspeitas": 3
  }
}
```

## Fluxo Tecnico Simplificado

```text
Arquivos CSV
-> ETL em Python
-> PostgreSQL operacional
-> Data Warehouse dimensional
-> FastAPI
-> Swagger
-> JSON
```

O ETL le os arquivos em `data/raw`, valida dados como CPF e transacoes invalidas, carrega as tabelas operacionais e monta as tabelas dimensionais. A API FastAPI consulta o PostgreSQL e expoe os dados em endpoints REST documentados automaticamente pelo Swagger.

## Como Explicar em Entrevista

Resumo de 1 minuto:

> O BankGuard e uma plataforma de dados bancarios simulada. Eu modelei um banco operacional em PostgreSQL com clientes, contas, agencias, produtos e transacoes. Depois criei um pipeline ETL em Python para ler CSVs, validar qualidade dos dados, carregar o modelo relacional e alimentar um Data Warehouse dimensional com fato e dimensoes. Por fim, expus os dados por uma API FastAPI com Swagger, incluindo endpoints de clientes, transacoes, estatisticas e possiveis fraudes.

Decisoes tecnicas importantes:

- Usei PostgreSQL por ser um banco relacional robusto, com suporte a constraints, indices, CTEs e window functions.
- Separei modelo operacional e dimensional para diferenciar integridade transacional de consultas analiticas.
- Validei dados antes da carga para simular cuidados reais de qualidade em ambientes bancarios.
- Usei FastAPI porque entrega uma API REST tipada e documentacao automatica via Swagger.
- Configurei testes e lint para mostrar boas praticas de Engenharia de Software.

## Exemplos de Perguntas de Negocio

- Qual cliente movimentou mais dinheiro?
- Qual agencia teve maior volume financeiro?
- Quantas transacoes foram realizadas por dia?
- Quais transacoes foram classificadas como suspeitas?
- Quais registros foram rejeitados por qualidade de dados?

As consultas estao em `sql/analytics`, `sql/data_quality` e `sql/performance`.

## Roadmap Tecnico

- Adicionar autenticação JWT nos endpoints.
- Criar dashboard analitico com Streamlit ou Power BI.
- Evoluir regras de fraude com score de risco.
- Adicionar orquestracao com Airflow.
- Criar migrations versionadas com Alembic.
- Expandir testes de integracao com PostgreSQL em container.

## Licenca

Este projeto esta licenciado sob a MIT License. Veja o arquivo [LICENSE](LICENSE).
