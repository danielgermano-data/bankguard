# Fase 3: Modelagem Dimensional

## Objetivo

A modelagem dimensional do BankGuard foi criada para consultas analiticas. Enquanto o modelo operacional prioriza integridade e normalizacao, o modelo dimensional prioriza leitura, agregacao e resposta rapida a perguntas de negocio.

## Granularidade da Fato

A tabela `dw.fato_transacoes` possui uma linha por transacao bancaria valida carregada no Data Warehouse.

Essa granularidade permite responder perguntas como:

- Qual foi o valor total movimentado?
- Quantas transacoes foram aprovadas?
- Quais transacoes parecem suspeitas?
- Qual cliente movimentou mais?
- Qual agencia concentrou maior volume?

## Tabela Fato

### `dw.fato_transacoes`

Guarda o evento financeiro principal.

Campos principais:

- `transacao_id`
- `cliente_sk`
- `conta_origem_sk`
- `conta_destino_sk`
- `agencia_sk`
- `produto_sk`
- `tempo_sk`
- `tipo_transacao`
- `canal`
- `status_transacao`
- `valor`
- `flag_suspeita`
- `motivo_suspeita`

## Dimensoes

### `dw.dim_cliente`

Responde: quem e o cliente?

Inclui atributos como nome, CPF, status, faixa de renda e faixa de risco.

### `dw.dim_conta`

Responde: qual conta participou da transacao?

Inclui numero da conta, status e data de abertura.

### `dw.dim_tempo`

Responde: quando a transacao ocorreu?

Inclui data, ano, mes, dia, trimestre e dia da semana.

### `dw.dim_produto`

Responde: qual produto bancario estava associado a conta?

Exemplos: conta corrente basica, conta corrente premium e poupanca.

### `dw.dim_agencia`

Responde: por qual agencia a conta e atendida?

Inclui codigo, nome, tipo de agencia, cidade e estado.

## Decisao Tecnica

Foi usado um modelo estrela simples:

```text
dim_cliente
dim_conta
dim_tempo
dim_produto
dim_agencia
        \ | /
   fato_transacoes
```

Esse desenho facilita consultas com `JOIN`, `GROUP BY`, filtros por tempo e agregacoes por dimensoes de negocio.

## Como Explicar em Entrevista

> Modelei o Data Warehouse em formato estrela, com `fato_transacoes` como evento central e dimensoes de cliente, conta, tempo, produto e agencia. A granularidade da fato e uma linha por transacao valida, o que permite analises por periodo, cliente, agencia, produto, canal e suspeita de fraude.
