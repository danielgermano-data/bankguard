# ADR 0001: Arquitetura Inicial do BankGuard

## Status

Aceita

## Contexto

O projeto BankGuard precisa simular um ambiente bancario real para demonstrar competencias de Engenharia de Dados Junior, incluindo Python, SQL, PostgreSQL, FastAPI, ETL, modelagem relacional, modelagem dimensional, qualidade de dados e documentacao tecnica.

O projeto tambem precisa ser executavel localmente, simples de publicar no GitHub e claro para recrutadores e entrevistadores tecnicos.

## Decisao

Adotar uma arquitetura modular em camadas:

- API REST com FastAPI.
- Banco operacional relacional em PostgreSQL.
- Pipeline ETL em Python.
- Data Warehouse dimensional tambem em PostgreSQL.
- Consultas SQL versionadas no repositorio.
- Testes automatizados com Pytest.
- Ambiente local com Docker Compose.

## Consequencias Positivas

- O projeto fica simples de executar localmente.
- O uso de PostgreSQL permite demonstrar SQL real, constraints, indices e otimizacao.
- A separacao entre operacional e analitico mostra maturidade de modelagem.
- A organizacao por camadas facilita manutencao e explicacao em entrevistas.
- A API com FastAPI entrega Swagger automaticamente, o que melhora a demonstracao do projeto.

## Consequencias Negativas

- PostgreSQL nao representa todos os recursos de um Data Warehouse cloud moderno.
- O ETL inicial em lote nao cobre streaming nem processamento distribuido.
- A arquitetura local e menor que um ambiente bancario corporativo real.

## Mitigacoes

- Documentar claramente quais decisoes foram tomadas por escopo de portfolio.
- Criar um roadmap com evolucoes possiveis, como orquestracao, dbt, Airflow, CDC, streaming e cloud.
- Usar boas praticas de qualidade, testes e versionamento desde a primeira versao.
