# Roteiro de Tarefas por Etapas

## Como Usar Este Roteiro

Este roteiro separa o projeto BankGuard em etapas pequenas.

Para cada etapa, voce tera:

- O que precisa entender.
- O que precisa fazer no projeto.
- O que precisa saber explicar em entrevista.
- Quando considerar a etapa concluida.

Nao tente fazer tudo de uma vez. O objetivo e evoluir com calma, construindo conhecimento e projeto ao mesmo tempo.

## Etapa 0: Entender a Ideia do Projeto

### Objetivo

Entender o que o BankGuard faz.

### Voce precisa entender

- O projeto simula um ambiente bancario.
- O sistema trabalha com clientes, contas, agencias, produtos e transacoes.
- O objetivo e transformar dados bancarios em informacao util.

### Tarefas

- [ ] Ler o README.
- [ ] Ler o guia iniciante.
- [ ] Escrever com suas palavras o que o BankGuard faz.
- [ ] Explicar o fluxo geral: entrada de dados, banco, ETL, Data Warehouse e API.

### Como explicar em entrevista

> O BankGuard e uma plataforma simulada de monitoramento de transacoes bancarias. Ele armazena dados operacionais, valida qualidade, executa ETL, organiza dados em um modelo dimensional e expoe informacoes por uma API REST.

### Concluido quando

Voce conseguir explicar o projeto em menos de um minuto.

## Etapa 1: Organizacao do Projeto

### Objetivo

Entender a estrutura de pastas.

### Voce precisa entender

- `app/` guarda a API.
- `database/` guarda scripts SQL.
- `etl/` guarda pipeline Python.
- `data/` guarda arquivos de dados.
- `sql/` guarda consultas analiticas.
- `docs/` guarda documentacao.
- `tests/` guarda testes.

### Tarefas

- [ ] Abrir a pasta do projeto.
- [ ] Identificar onde fica cada tipo de arquivo.
- [ ] Entender por que codigo, SQL, dados e docs ficam separados.

### Como explicar em entrevista

> Organizei o projeto por responsabilidade, separando API, banco, ETL, dados, consultas SQL, testes e documentacao. Isso facilita manutencao, leitura e evolucao do projeto.

### Concluido quando

Voce conseguir apontar onde criaria um arquivo de API, um SQL, um script ETL e uma documentacao.

## Etapa 2: Modelagem Relacional

### Objetivo

Entender as tabelas operacionais do sistema bancario.

### Voce precisa entender

- O que e tabela.
- O que e chave primaria.
- O que e chave estrangeira.
- O que e relacionamento 1:N.
- Por que o modelo operacional deve ser consistente.

### Tarefas

- [ ] Ler `docs/02-modelagem-relacional.md`.
- [ ] Entender `tabela_clientes`.
- [ ] Entender `tabela_contas`.
- [ ] Entender `tabela_agencias`.
- [ ] Entender `tabela_produtos`.
- [ ] Entender `tabela_transacoes`.
- [ ] Abrir o diagrama ER.
- [ ] Explicar por que `tabela_contas` tem `cliente_id`.
- [ ] Explicar por que `tabela_transacoes` tem `conta_origem_id` e `conta_destino_id`.

### Como explicar em entrevista

> Modelei o banco operacional de forma normalizada, separando clientes, contas, agencias, produtos e transacoes. Usei chaves primarias e estrangeiras para manter integridade referencial e evitar inconsistencias.

### Concluido quando

Voce conseguir explicar como uma transacao se conecta a uma conta e como a conta se conecta a um cliente.

## Etapa 3: DDL no PostgreSQL

### Objetivo

Criar as tabelas reais no PostgreSQL.

### Voce precisa entender

- `CREATE TABLE`
- `PRIMARY KEY`
- `FOREIGN KEY`
- `UNIQUE`
- `NOT NULL`
- `CHECK`
- Tipos de dados como `BIGSERIAL`, `VARCHAR`, `NUMERIC`, `DATE`, `TIMESTAMP`

### Tarefas

- [ ] Criar arquivo `database/ddl/001_create_operational_schema.sql`.
- [ ] Criar tabela de clientes.
- [ ] Criar tabela de agencias.
- [ ] Criar tabela de produtos.
- [ ] Criar tabela de contas.
- [ ] Criar tabela de transacoes.
- [ ] Adicionar chaves primarias.
- [ ] Adicionar chaves estrangeiras.
- [ ] Adicionar constraints de negocio.
- [ ] Testar o script no PostgreSQL.

### Como explicar em entrevista

> Transformei a modelagem relacional em DDL PostgreSQL, usando constraints para garantir regras de negocio no proprio banco, como unicidade de CPF, valor positivo em transacoes e integridade entre contas e transacoes.

### Concluido quando

O PostgreSQL criar todas as tabelas sem erro.

## Etapa 4: Dados de Exemplo

### Objetivo

Criar dados simulados para testar o projeto.

### Voce precisa entender

- Dados brutos.
- Arquivos CSV.
- Dados validos e invalidos.
- Por que precisamos de dados ruins para testar qualidade.

### Tarefas

- [ ] Criar `data/raw/clientes.csv`.
- [ ] Criar `data/raw/agencias.csv`.
- [ ] Criar `data/raw/produtos.csv`.
- [ ] Criar `data/raw/contas.csv`.
- [ ] Criar `data/raw/transacoes.csv`.
- [ ] Incluir alguns dados corretos.
- [ ] Incluir alguns dados propositalmente invalidos.

### Como explicar em entrevista

> Criei dados simulados para representar um ambiente bancario e tambem inclui registros invalidos para testar as regras de qualidade do pipeline.

### Concluido quando

Existirem arquivos CSV suficientes para testar carga, validacao e consultas.

## Etapa 5: Qualidade de Dados

### Objetivo

Evitar que dados errados entrem no pipeline.

### Voce precisa entender

- Completude: campo obrigatorio preenchido.
- Unicidade: nao pode duplicar.
- Validade: CPF e datas validas.
- Consistencia: conta e transacao fazem sentido.

### Tarefas

- [ ] Criar validador de CPF.
- [ ] Validar campos obrigatorios.
- [ ] Validar duplicidade de CPF.
- [ ] Validar transacao com valor maior que zero.
- [ ] Validar conta origem diferente da conta destino.
- [ ] Separar registros validos e rejeitados.
- [ ] Criar testes unitarios para validacoes.

### Como explicar em entrevista

> Implementei validacoes de qualidade para garantir completude, unicidade, validade e consistencia antes de carregar os dados. Isso reduz risco de analises incorretas.

### Concluido quando

O pipeline conseguir identificar dados validos e rejeitar dados ruins com motivo claro.

## Etapa 6: ETL em Python

### Objetivo

Criar o pipeline que move dados da origem para o banco.

### Voce precisa entender

- Extract: extrair dados.
- Transform: transformar dados.
- Load: carregar dados.
- Logs e rastreabilidade.

### Tarefas

- [ ] Criar extratores para ler CSV.
- [ ] Criar transformacoes de padronizacao.
- [ ] Integrar validacoes.
- [ ] Criar loaders para PostgreSQL.
- [ ] Registrar logs da execucao.
- [ ] Criar uma forma simples de executar o pipeline.

### Como explicar em entrevista

> Desenvolvi um ETL em Python que le arquivos CSV, valida regras de qualidade, transforma campos para um padrao confiavel e carrega os dados no PostgreSQL.

### Concluido quando

Voce conseguir executar o ETL e ver dados carregados no banco.

## Etapa 7: Modelagem Dimensional

### Objetivo

Criar o modelo analitico para responder perguntas de negocio.

### Voce precisa entender

- Tabela fato.
- Tabela dimensao.
- Granularidade.
- Chave substituta.
- Diferenca entre operacional e analitico.

### Tarefas

- [ ] Criar desenho da `fato_transacoes`.
- [ ] Criar desenho da `dim_cliente`.
- [ ] Criar desenho da `dim_conta`.
- [ ] Criar desenho da `dim_tempo`.
- [ ] Criar desenho da `dim_produto`.
- [ ] Criar desenho da `dim_agencia`.
- [ ] Explicar a granularidade da fato.

### Como explicar em entrevista

> Modelei um Data Warehouse dimensional com `fato_transacoes` no centro e dimensoes de cliente, conta, tempo, produto e agencia para facilitar analises e agregacoes.

### Concluido quando

Voce conseguir explicar o que fica na fato e o que fica nas dimensoes.

## Etapa 8: Consultas SQL Analiticas

### Objetivo

Responder perguntas de negocio usando SQL.

### Voce precisa entender

- `JOIN`
- `GROUP BY`
- `CTE`
- `Window Functions`
- Agregacoes

### Tarefas

- [ ] Criar consulta de volume por cliente.
- [ ] Criar consulta de volume por agencia.
- [ ] Criar consulta de transacoes por dia.
- [ ] Criar consulta de maiores transacoes.
- [ ] Criar consulta de suspeita de fraude.
- [ ] Criar consulta com window function.

### Como explicar em entrevista

> Criei consultas SQL para responder perguntas de negocio bancario usando joins, agregacoes, CTEs e window functions.

### Concluido quando

Voce tiver pelo menos cinco consultas explicadas no projeto.

## Etapa 9: API FastAPI

### Objetivo

Expor dados por endpoints REST.

### Voce precisa entender

- O que e API.
- O que e endpoint.
- O que e JSON.
- O que e paginacao.
- O que e tratamento de erro.
- O que e Swagger.

### Tarefas

- [ ] Criar aplicacao FastAPI.
- [ ] Criar `GET /clientes`.
- [ ] Criar `GET /clientes/{id}`.
- [ ] Criar `GET /transacoes`.
- [ ] Criar `GET /transacoes/{id}`.
- [ ] Criar `GET /estatisticas`.
- [ ] Criar `GET /fraudes`.
- [ ] Adicionar paginacao.
- [ ] Adicionar tratamento de erros.
- [ ] Testar Swagger.

### Como explicar em entrevista

> Usei FastAPI para criar endpoints REST que permitem consultar clientes, transacoes, estatisticas e possiveis fraudes, com documentacao automatica via Swagger.

### Concluido quando

Voce conseguir abrir o Swagger e testar os endpoints.

## Etapa 10: Performance e Indices

### Objetivo

Melhorar consultas importantes.

### Voce precisa entender

- Indice.
- Filtro.
- Join.
- Plano de execucao.
- Por que nem toda coluna precisa de indice.

### Tarefas

- [ ] Criar indices para FKs.
- [ ] Criar indice para CPF.
- [ ] Criar indice para data da transacao.
- [ ] Criar indice para status da transacao.
- [ ] Usar `EXPLAIN` em consultas importantes.
- [ ] Documentar decisoes de performance.

### Como explicar em entrevista

> Criei indices em colunas usadas em joins, filtros e consultas temporais. Tambem analisei planos de execucao para entender o impacto das otimizacoes.

### Concluido quando

Voce conseguir explicar por que cada indice existe.

## Etapa 11: Testes

### Objetivo

Garantir que partes importantes funcionam.

### Voce precisa entender

- Teste unitario.
- Teste de integracao.
- Teste de API.
- Teste de regra de negocio.

### Tarefas

- [ ] Testar validacao de CPF.
- [ ] Testar validacao de transacao.
- [ ] Testar transformacoes do ETL.
- [ ] Testar endpoints principais.
- [ ] Documentar como rodar testes.

### Como explicar em entrevista

> Criei testes automatizados para validar regras criticas do pipeline e da API, reduzindo risco de regressao.

### Concluido quando

Os testes principais executarem com sucesso.

## Etapa 12: GitHub e Portifolio

### Objetivo

Preparar o projeto para recrutadores.

### Voce precisa entender

- README profissional.
- Commits organizados.
- Como explicar decisoes tecnicas.
- Como demonstrar o projeto.

### Tarefas

- [ ] Melhorar README final.
- [ ] Adicionar instrucoes de execucao.
- [ ] Adicionar exemplos de endpoints.
- [ ] Adicionar exemplos de consultas SQL.
- [ ] Adicionar arquitetura.
- [ ] Adicionar roadmap.
- [ ] Fazer commits por etapa.
- [ ] Publicar no GitHub.

### Como explicar em entrevista

> Estruturei o projeto para ser reproduzivel, documentado e facil de avaliar, com README, arquitetura, instrucoes de execucao, exemplos de uso e roadmap tecnico.

### Concluido quando

O repositorio estiver pronto para ser enviado em candidaturas.

## Etapa 13: Preparacao Para Entrevistas

### Objetivo

Treinar explicacao tecnica do projeto.

### Voce precisa entender

- Por que escolheu PostgreSQL.
- Por que usou FastAPI.
- Por que separou operacional e dimensional.
- Como funciona o ETL.
- Como tratou qualidade.
- Como pensou performance.

### Tarefas

- [ ] Criar resumo de 1 minuto do projeto.
- [ ] Criar resumo tecnico de 3 minutos.
- [ ] Treinar perguntas sobre modelagem.
- [ ] Treinar perguntas sobre SQL.
- [ ] Treinar perguntas sobre ETL.
- [ ] Treinar perguntas sobre API.
- [ ] Treinar perguntas sobre qualidade de dados.

### Como explicar em entrevista

> Eu consigo explicar o BankGuard de ponta a ponta: arquitetura, banco operacional, ETL, Data Warehouse, consultas analiticas, API, qualidade de dados e decisoes de performance.

### Concluido quando

Voce conseguir defender cada decisao do projeto com suas palavras.

## Ordem de Execucao Recomendada

1. Entender a ideia do projeto.
2. Entender a organizacao das pastas.
3. Entender a modelagem relacional.
4. Criar DDL PostgreSQL.
5. Criar dados de exemplo.
6. Implementar qualidade de dados.
7. Implementar ETL.
8. Criar modelagem dimensional.
9. Criar consultas SQL analiticas.
10. Criar API FastAPI.
11. Melhorar performance.
12. Criar testes.
13. Preparar GitHub e entrevista.

## Sua Primeira Tarefa Agora

Antes de escrever mais codigo, faca esta tarefa:

```text
Explique com suas palavras:

1. O que e o BankGuard?
2. O que e uma tabela?
3. Para que serve a tabela_clientes?
4. Para que serve a tabela_contas?
5. Para que serve a tabela_transacoes?
```

Essa tarefa e importante porque voce precisa conseguir falar sobre o projeto antes de codar tudo.
