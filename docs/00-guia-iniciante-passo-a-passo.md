# Guia Iniciante: Como Entender e Aplicar o BankGuard

## Objetivo Deste Guia

Este guia explica o projeto BankGuard do jeito mais simples possivel.

A ideia e voce entender:

- O que estamos construindo.
- Por que cada parte existe.
- Como cada parte entra no projeto.
- Como explicar isso em uma entrevista.

## A Frase Central do Projeto

O BankGuard recebe dados bancarios, valida a qualidade, armazena em PostgreSQL, transforma os dados para analise e expoe informacoes por uma API.

Em outras palavras:

```text
Dados entram
-> banco guarda
-> ETL trata
-> Data Warehouse organiza para analise
-> API mostra os resultados
```

## Passo 1: Entender o Problema

Antes de criar codigo, precisamos entender o problema.

O BankGuard simula um banco que precisa monitorar transacoes.

Perguntas que o sistema deve responder:

- Quem e o cliente?
- Qual conta ele possui?
- Quais transacoes ele realizou?
- Quanto dinheiro foi movimentado?
- Existe alguma transacao suspeita?
- Qual agencia movimentou mais?
- Qual produto bancario e mais usado?

## Passo 2: Entender as Pastas do Projeto

A estrutura do projeto existe para separar responsabilidades.

```text
bankguard/
|-- app/          codigo da API FastAPI
|-- database/     scripts SQL do banco
|-- etl/          pipeline de dados em Python
|-- data/         arquivos CSV de entrada
|-- sql/          consultas analiticas
|-- docs/         documentacao tecnica
|-- tests/        testes automatizados
```

### Por Que Isso Importa?

Em projetos profissionais, codigo, SQL, dados e documentacao nao ficam misturados.

Essa organizacao mostra maturidade tecnica e facilita a manutencao.

## Passo 3: Entender Tabelas

Uma tabela guarda dados sobre um assunto.

No BankGuard, temos cinco tabelas operacionais principais:

```text
tabela_clientes
tabela_agencias
tabela_produtos
tabela_contas
tabela_transacoes
```

Cada tabela representa uma parte do negocio bancario.

### Exemplo

`tabela_clientes` guarda dados dos clientes:

```text
cliente_id
cpf
nome_completo
data_nascimento
email
status_cliente
```

`tabela_transacoes` guarda movimentos financeiros:

```text
transacao_id
conta_origem_id
conta_destino_id
tipo_transacao
valor
data_hora_transacao
status_transacao
```

## Passo 4: Entender Chave Primaria

Chave primaria e o identificador unico de uma linha.

Exemplos:

```text
cliente_id
conta_id
transacao_id
agencia_id
produto_id
```

Pense assim:

> Mesmo que existam dois clientes chamados Joao, cada um tera um `cliente_id` diferente.

### Como Explicar em Entrevista

> Usei chaves primarias tecnicas para identificar cada registro de forma unica e estavel, sem depender diretamente de dados de negocio como CPF ou numero da conta.

## Passo 5: Entender Chave Estrangeira

Chave estrangeira liga uma tabela a outra.

Exemplo:

```text
tabela_contas.cliente_id -> tabela_clientes.cliente_id
```

Isso significa:

> Esta conta pertence a este cliente.

Outro exemplo:

```text
tabela_transacoes.conta_origem_id -> tabela_contas.conta_id
```

Isso significa:

> Esta transacao saiu desta conta.

### Como Explicar em Entrevista

> Usei chaves estrangeiras para garantir integridade referencial entre clientes, contas, agencias, produtos e transacoes. Assim, uma transacao nao aponta para uma conta inexistente.

## Passo 6: Entender Relacionamentos

Relacionamento mostra como as tabelas se conectam.

### Cliente e Conta

Um cliente pode ter varias contas.

```text
tabela_clientes 1 ---- N tabela_contas
```

Exemplo:

```text
Ana -> Conta Corrente
Ana -> Conta Poupanca
```

### Agencia e Conta

Uma agencia pode ter varias contas.

```text
tabela_agencias 1 ---- N tabela_contas
```

### Produto e Conta

Um produto pode estar associado a varias contas.

```text
tabela_produtos 1 ---- N tabela_contas
```

### Conta e Transacao

Uma conta pode participar de varias transacoes.

```text
tabela_contas 1 ---- N tabela_transacoes
```

## Passo 7: Entender Uma Transacao Bancaria

Uma transacao e o evento principal do projeto.

Exemplo:

```text
conta_origem_id: 100
conta_destino_id: 200
tipo_transacao: PIX
valor: 500.00
status_transacao: APROVADA
```

Traducao:

> A conta 100 enviou R$ 500,00 para a conta 200 via PIX.

Essa tabela sera muito importante para:

- Analises.
- Deteccao de fraude.
- Metricas bancarias.
- Data Warehouse.

## Passo 8: Entender ETL

ETL significa:

```text
Extract -> Transform -> Load
Extrair -> Transformar -> Carregar
```

No BankGuard:

```text
CSV bruto
-> validacao
-> transformacao
-> PostgreSQL
```

### Extract

Ler dados de origem.

Exemplo:

```text
data/raw/clientes.csv
data/raw/contas.csv
data/raw/transacoes.csv
```

### Transform

Corrigir e padronizar dados.

Exemplos:

```text
remover pontuacao do CPF
padronizar datas
converter textos para maiusculo
validar valores monetarios
```

### Load

Carregar os dados no banco.

Exemplo:

```text
inserir clientes no PostgreSQL
inserir contas no PostgreSQL
inserir transacoes no PostgreSQL
```

### Como Explicar em Entrevista

> Criei um pipeline ETL para extrair dados brutos, aplicar validacoes de qualidade, transformar os campos para um padrao confiavel e carregar os dados no banco PostgreSQL.

## Passo 9: Entender Qualidade de Dados

Qualidade de dados evita que informacoes erradas entrem no sistema.

Exemplos de problemas:

```text
CPF invalido
cliente sem nome
transacao com valor negativo
conta inexistente
transacao duplicada
data vazia
```

Regras que vamos implementar:

```text
CPF deve ser valido
CPF nao pode duplicar
valor da transacao deve ser maior que zero
conta origem deve existir
conta destino deve existir quando informada
conta origem nao pode ser igual a conta destino
```

### Como Explicar em Entrevista

> Tratei qualidade de dados como parte central do pipeline, validando completude, unicidade, consistencia e regras de negocio antes de carregar dados analiticos.

## Passo 10: Entender Data Warehouse

O banco operacional guarda dados do dia a dia.

O Data Warehouse organiza dados para analise.

No BankGuard, teremos:

```text
fato_transacoes
dim_cliente
dim_conta
dim_tempo
dim_produto
dim_agencia
```

### Tabela Fato

A tabela fato guarda o evento principal.

No nosso projeto:

```text
fato_transacoes
```

Ela guarda principalmente:

```text
valor
quantidade
data
conta
cliente
produto
agencia
```

### Tabelas Dimensao

Dimensoes explicam o contexto da fato.

```text
dim_cliente   -> quem?
dim_conta     -> qual conta?
dim_tempo     -> quando?
dim_produto   -> qual produto?
dim_agencia   -> qual agencia?
```

### Como Explicar em Entrevista

> Separei o modelo operacional do modelo dimensional. O operacional foca integridade e normalizacao. O dimensional foca analise, agregacao e facilidade para responder perguntas de negocio.

## Passo 11: Entender Consultas SQL

Depois que os dados estao organizados, usamos SQL para responder perguntas.

Exemplos:

```text
Qual cliente movimentou mais dinheiro?
Qual agencia teve maior volume?
Quantas transacoes foram aprovadas por dia?
Quais contas tiveram comportamento suspeito?
```

Recursos SQL que vamos usar:

```text
JOIN
GROUP BY
CTE
Window Functions
Agregacoes
```

## Passo 12: Entender API

A API permite consultar os dados por URLs.

Exemplos:

```text
GET /clientes
GET /clientes/1
GET /transacoes
GET /transacoes/10
GET /estatisticas
GET /fraudes
```

Exemplo de resposta:

```json
{
  "cliente_id": 1,
  "nome_completo": "Ana Souza",
  "status_cliente": "ATIVO"
}
```

### Como Explicar em Entrevista

> Usei FastAPI para expor os dados por endpoints REST com documentacao automatica via Swagger, paginacao e tratamento de erros.

## Ordem Recomendada de Estudo

Estude nesta ordem:

1. O que e uma tabela.
2. O que e chave primaria.
3. O que e chave estrangeira.
4. Como tabelas se relacionam.
5. O que e uma transacao bancaria.
6. O que e ETL.
7. O que e qualidade de dados.
8. O que e Data Warehouse.
9. O que e consulta SQL analitica.
10. O que e API REST.

## Exercicio Para Voce

Antes de avancarmos, tente responder com suas palavras:

1. Para que serve a `tabela_clientes`?
2. Para que serve a `tabela_contas`?
3. Por que `tabela_contas` tem `cliente_id`?
4. O que uma linha em `tabela_transacoes` representa?
5. Qual a diferenca entre banco operacional e Data Warehouse?

Nao precisa responder perfeito. O objetivo e treinar raciocinio tecnico.
