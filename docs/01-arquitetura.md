# Fase 1: Arquitetura do Projeto

## Visao Geral

O BankGuard sera construido como uma plataforma de dados bancarios com tres responsabilidades principais:

1. Receber e armazenar transacoes bancarias em um modelo relacional.
2. Validar, transformar e carregar dados para um Data Warehouse dimensional.
3. Expor dados operacionais e analiticos por meio de uma API REST com FastAPI.

A arquitetura foi pensada para simular um ambiente bancario real, mas com escopo adequado para um projeto de portfolio. O objetivo e demonstrar dominio de Engenharia de Dados sem criar complexidade artificial.

## Estrutura de Diretorios

```text
bankguard/
|-- app/
|   |-- api/
|   |-- core/
|   |-- models/
|   |-- repositories/
|   |-- schemas/
|   `-- services/
|-- configs/
|-- data/
|   |-- raw/
|   |-- staging/
|   `-- processed/
|-- database/
|   |-- ddl/
|   |-- dml/
|   `-- migrations/
|-- docs/
|   |-- decisions/
|   `-- diagrams/
|-- etl/
|   |-- extractors/
|   |-- loaders/
|   |-- transforms/
|   `-- validators/
|-- sql/
|   |-- analytics/
|   |-- data_quality/
|   `-- performance/
|-- tests/
|   |-- integration/
|   `-- unit/
|-- docker-compose.yml
|-- pyproject.toml
|-- .env.example
`-- README.md
```

## Papel de Cada Camada

### app

Contem a aplicacao FastAPI. Essa camada sera responsavel por expor endpoints REST, receber parametros de consulta, aplicar paginacao, tratar erros e retornar respostas padronizadas.

Subpastas planejadas:

- `api`: rotas e controllers FastAPI.
- `core`: configuracoes, conexao com banco e dependencias compartilhadas.
- `models`: modelos ORM das tabelas relacionais.
- `schemas`: contratos Pydantic de entrada e saida.
- `repositories`: consultas ao banco isoladas da camada de API.
- `services`: regras de negocio e orquestracao.

### database

Contem scripts SQL versionados. A separacao entre DDL, DML e migrations ajuda a mostrar disciplina de banco de dados.

- `ddl`: criacao de tabelas, constraints, chaves e indices.
- `dml`: cargas iniciais e dados de apoio.
- `migrations`: evolucao incremental do schema.

### etl

Contem o pipeline de dados em Python.

- `extractors`: leitura de dados de origem.
- `validators`: regras de qualidade, como CPF, nulos, duplicidade e consistencia.
- `transforms`: padronizacao e preparacao para o Data Warehouse.
- `loaders`: carga nas tabelas dimensionais e fatos.

### data

Area local para arquivos de dados durante desenvolvimento.

- `raw`: dados brutos recebidos sem transformacao.
- `staging`: dados intermediarios ja padronizados.
- `processed`: dados prontos para carga analitica.

Em um ambiente bancario real, essa camada poderia estar em um Data Lake, storage corporativo ou fila/event stream. Para portfolio, arquivos locais versionados apenas como exemplos sao suficientes.

### sql

Contem consultas analiticas, validacoes e estudos de performance.

- `analytics`: perguntas de negocio e metricas.
- `data_quality`: consultas para auditoria de qualidade.
- `performance`: consultas com foco em indices, planos e otimizacao.

### tests

Contem testes automatizados.

- `unit`: testes de funcoes isoladas, como validacao de CPF.
- `integration`: testes envolvendo banco, API ou pipeline ETL.

## Fluxo de Dados

1. Uma transacao bancaria e recebida pela API ou por arquivo de carga.
2. O dado bruto e persistido ou armazenado na camada `raw`.
3. O ETL extrai os dados da origem.
4. Regras de qualidade validam campos obrigatorios, CPF, duplicidade e consistencia.
5. Dados validos sao transformados e padronizados.
6. O modelo relacional armazena entidades operacionais como clientes, contas, agencias, produtos e transacoes.
7. O pipeline carrega dimensoes e fato no Data Warehouse.
8. Consultas SQL calculam metricas bancarias e indicios de fraude.
9. A API FastAPI expoe dados operacionais e analiticos.

## Tecnologias Utilizadas

### Python

Linguagem principal do projeto. E amplamente usada em Engenharia de Dados para ETL, validacao, automacao, APIs e testes.

### PostgreSQL

Banco relacional escolhido por ter excelente suporte a SQL, constraints, indices, transacoes ACID, CTEs, window functions e analise de planos de execucao.

### FastAPI

Framework para criacao da API REST. Foi escolhido por oferecer boa performance, tipagem com Pydantic e documentacao automatica via Swagger/OpenAPI.

### SQLAlchemy

Camada de acesso ao banco para a API. Ajuda a organizar modelos, sessoes e consultas sem abandonar SQL quando consultas analiticas exigirem controle fino.

### Pydantic

Validacao de schemas da API e configuracoes. Ajuda a manter contratos explicitos de entrada e saida.

### Pandas

Ferramenta util para a primeira versao do pipeline ETL em lote. Em ambientes maiores, poderia ser substituida ou complementada por Spark, dbt ou orquestradores.

### Pytest

Framework de testes automatizados, usado para validar regras criticas como CPF, duplicidade, consistencia de transacoes e contratos da API.

### Docker Compose

Facilita subir o PostgreSQL localmente com configuracao reproduzivel.

## Decisoes Tecnicas

### Separar modelo relacional e modelo dimensional

O modelo relacional representa o sistema operacional, com foco em integridade, normalizacao e relacionamento entre entidades bancarias.

O modelo dimensional representa o ambiente analitico, com foco em consultas de negocio, agregacoes e performance para leitura.

Essa separacao e comum em ambientes de dados porque evita misturar necessidades transacionais com necessidades analiticas.

### Usar PostgreSQL tambem como Data Warehouse

Para um projeto de portfolio, usar PostgreSQL para as duas camadas reduz o custo operacional e permite demonstrar SQL avancado. Em uma empresa, o Data Warehouse poderia estar em BigQuery, Snowflake, Redshift, Databricks ou outra plataforma analitica.

### Comecar com ETL em lote

O primeiro pipeline sera em lote para manter o projeto compreensivel e testavel. Depois, o roadmap pode evoluir para ingestao incremental, CDC, filas ou streaming.

### Priorizar qualidade de dados desde o inicio

Dados bancarios exigem confiabilidade. Validacoes de CPF, nulos, duplicidade, saldos, valores negativos indevidos e consistencia de chaves serao tratadas como parte central do projeto, nao como detalhe secundario.

## Pontos de Atencao Bancarios

- Integridade referencial entre cliente, conta, agencia, produto e transacao.
- Rastreabilidade das cargas de dados.
- Auditoria de registros rejeitados.
- Tratamento de dados sensiveis.
- Separacao entre dados operacionais e analiticos.
- Indices em colunas usadas para filtros, joins e consultas temporais.
- Regras claras para deteccao de padroes suspeitos.

## Proximas Fases

A proxima etapa sera a **Fase 2: Modelagem Relacional**, em que criaremos as entidades:

- `tabela_clientes`
- `tabela_contas`
- `tabela_transacoes`
- `tabela_agencias`
- `tabela_produtos`

Tambem definiremos os relacionamentos, cardinalidades e o diagrama ER.
