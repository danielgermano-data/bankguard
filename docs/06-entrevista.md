# Preparacao Para Entrevistas

Este documento ajuda a explicar o BankGuard em entrevistas para vagas de Engenharia de Dados Junior.

O objetivo nao e decorar respostas. O objetivo e entender o projeto bem o suficiente para falar com seguranca.

## Resumo de 1 Minuto

O BankGuard e uma plataforma simulada de monitoramento e analise de transacoes bancarias.

No projeto, eu criei um fluxo completo de dados: arquivos CSV entram como dados brutos, um pipeline ETL em Python valida e carrega os dados no PostgreSQL, o banco possui um modelo operacional relacional e um Data Warehouse dimensional, e uma API FastAPI expoe informacoes por endpoints documentados no Swagger.

O projeto tambem possui testes automatizados, lint com Ruff, Docker Compose e GitHub Actions para validar o codigo no GitHub.

## Explicacao Tecnica Curta

```text
CSV -> ETL Python -> PostgreSQL operacional -> Data Warehouse -> FastAPI -> Swagger -> JSON
```

O ETL le arquivos da pasta `data/raw`, valida CPF e regras de transacao, carrega tabelas operacionais e depois monta dimensoes e fato no schema `dw`. A API consulta essas tabelas e retorna dados de clientes, transacoes, estatisticas e possiveis fraudes.

## Perguntas e Respostas

### 1. O que e o BankGuard?

Resposta junior:

> O BankGuard e um projeto de Engenharia de Dados que simula uma plataforma bancaria. Ele recebe dados de clientes, contas e transacoes, carrega em PostgreSQL, executa validacoes de qualidade, cria um modelo analitico e expoe informacoes por uma API FastAPI.

Resposta mais forte:

> O BankGuard demonstra um fluxo de dados de ponta a ponta em um contexto bancario: ingestao de CSVs, ETL em Python, modelagem relacional, Data Warehouse dimensional, consultas SQL analiticas, API REST com Swagger, testes e CI.

### 2. Por que voce usou PostgreSQL?

Resposta junior:

> Usei PostgreSQL porque ele e um banco relacional forte, muito usado no mercado, e permite trabalhar com SQL, chaves, constraints, indices e consultas analiticas.

Resposta mais forte:

> O PostgreSQL foi escolhido porque permite demonstrar fundamentos importantes para Engenharia de Dados: integridade referencial, modelagem relacional, schemas separados, constraints, indices, joins, CTEs, agregacoes e window functions.

### 3. Qual a diferenca entre modelo relacional e modelo dimensional no projeto?

Resposta junior:

> O modelo relacional guarda os dados operacionais de forma organizada e consistente. O modelo dimensional organiza os dados para analise, usando tabela fato e dimensoes.

Resposta mais forte:

> No BankGuard, o modelo relacional representa o sistema operacional, com tabelas como clientes, contas, agencias, produtos e transacoes. O modelo dimensional representa a camada analitica, com `fato_transacoes` e dimensoes como cliente, conta, tempo, produto e agencia. Essa separacao facilita consultas de negocio sem misturar regras transacionais com analise.

### 4. O que e a `fato_transacoes`?

Resposta junior:

> A `fato_transacoes` e a tabela central do Data Warehouse. Cada linha representa uma transacao bancaria valida.

Resposta mais forte:

> A granularidade da `fato_transacoes` e uma linha por transacao valida. Ela guarda metricas e chaves para dimensoes, como cliente, conta, agencia, produto e tempo. Isso permite calcular volume financeiro, ticket medio, quantidade de transacoes e suspeitas de fraude.

### 5. Como funciona o ETL?

Resposta junior:

> O ETL le os arquivos CSV, valida os dados, transforma algumas informacoes e carrega no PostgreSQL.

Resposta mais forte:

> O ETL segue o fluxo Extract, Transform and Load. Ele extrai dados da pasta `data/raw`, valida CPF, campos obrigatorios, valores de transacao e contas relacionadas, registra rejeicoes em uma tabela de auditoria e carrega os dados validos no modelo operacional e no Data Warehouse.

### 6. Que regras de qualidade de dados voce implementou?

Resposta junior:

> Implementei validacao de CPF, validacao de valor positivo em transacoes e controle de registros rejeitados.

Resposta mais forte:

> O projeto trata qualidade de dados antes da carga analitica. Ele valida CPF, rejeita transacoes com valor invalido, verifica existencia de contas e registra registros rejeitados no schema de auditoria. Isso ajuda a manter confiabilidade nas metricas.

### 7. Como o projeto detecta possiveis fraudes?

Resposta junior:

> Ele marca algumas transacoes como suspeitas usando regras simples, como valor alto ou conta bloqueada.

Resposta mais forte:

> A deteccao de fraude neste MVP e baseada em regras. A `fato_transacoes` possui `flag_suspeita` e `motivo_suspeita`. Exemplos de regra sao transacao de valor alto e transacao envolvendo conta bloqueada. Em uma evolucao, isso poderia virar um score de risco mais robusto.

### 8. O que a API FastAPI faz?

Resposta junior:

> A API permite consultar clientes, transacoes, estatisticas e fraudes pelo navegador ou por ferramentas como Swagger.

Resposta mais forte:

> A API FastAPI expoe endpoints REST para consultar dados operacionais e analiticos. Ela possui documentacao automatica no Swagger e endpoints como `/clientes`, `/transacoes`, `/estatisticas` e `/fraudes`.

### 9. Quais endpoints foram validados?

Resposta:

```text
GET /health
GET /clientes
GET /clientes/{cliente_id}
GET /transacoes
GET /transacoes/{transacao_id}
GET /estatisticas
GET /fraudes
```

O endpoint `/estatisticas` retornou 8 transacoes, valor total de 85721.40, ticket medio de 10715.17 e 3 suspeitas.

### 10. Como voce testou o projeto?

Resposta junior:

> Eu rodei testes com Pytest e lint com Ruff.

Resposta mais forte:

> O projeto possui testes automatizados para regras importantes, como validacao de CPF e healthcheck da API. Tambem configurei Ruff para padronizacao do codigo e GitHub Actions para rodar testes e lint automaticamente a cada push.

### 11. Por que usar Docker Compose?

Resposta junior:

> Usei Docker Compose para subir o PostgreSQL localmente de forma simples.

Resposta mais forte:

> O Docker Compose torna o ambiente reproduzivel. Qualquer pessoa consegue subir o PostgreSQL com a mesma configuracao usando `docker compose up -d`, sem depender de uma instalacao manual do banco.

### 12. O que voce melhoraria em uma proxima versao?

Resposta:

> Eu adicionaria autenticação JWT na API, migrations com Alembic, mais testes de integracao, um dashboard analitico, orquestracao com Airflow e regras de fraude mais robustas baseadas em score de risco.

## Pontos Que Voce Deve Dominar

- Explicar o fluxo `CSV -> ETL -> PostgreSQL -> DW -> FastAPI`.
- Explicar o que e uma tabela fato.
- Explicar o que e uma dimensao.
- Explicar por que existe validacao de qualidade.
- Explicar por que Docker ajuda na reproducibilidade.
- Explicar por que o Swagger ajuda a demonstrar a API.

## Frase Final Para Entrevista

> O BankGuard foi importante porque me ajudou a praticar Engenharia de Dados de forma integrada. Eu nao trabalhei apenas com SQL ou apenas com Python; eu conectei ingestao, validacao, banco relacional, Data Warehouse, API, testes e GitHub em um projeto unico e demonstravel.
