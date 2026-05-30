CREATE SCHEMA IF NOT EXISTS operacional;
CREATE SCHEMA IF NOT EXISTS dw;
CREATE SCHEMA IF NOT EXISTS auditoria;

DROP TABLE IF EXISTS dw.fato_transacoes;
DROP TABLE IF EXISTS dw.dim_tempo;
DROP TABLE IF EXISTS dw.dim_conta;
DROP TABLE IF EXISTS dw.dim_cliente;
DROP TABLE IF EXISTS dw.dim_produto;
DROP TABLE IF EXISTS dw.dim_agencia;

DROP TABLE IF EXISTS auditoria.registros_rejeitados;

DROP TABLE IF EXISTS operacional.tabela_transacoes;
DROP TABLE IF EXISTS operacional.tabela_contas;
DROP TABLE IF EXISTS operacional.tabela_produtos;
DROP TABLE IF EXISTS operacional.tabela_agencias;
DROP TABLE IF EXISTS operacional.tabela_clientes;

CREATE TABLE operacional.tabela_clientes (
    cliente_id BIGINT PRIMARY KEY,
    cpf CHAR(11) NOT NULL UNIQUE,
    nome_completo VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(20),
    renda_mensal NUMERIC(15,2) CHECK (renda_mensal IS NULL OR renda_mensal >= 0),
    score_risco NUMERIC(5,2) CHECK (score_risco IS NULL OR score_risco BETWEEN 0 AND 100),
    status_cliente VARCHAR(20) NOT NULL CHECK (status_cliente IN ('ATIVO', 'INATIVO', 'BLOQUEADO')),
    data_cadastro DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operacional.tabela_agencias (
    agencia_id BIGINT PRIMARY KEY,
    codigo_agencia VARCHAR(10) NOT NULL UNIQUE,
    nome_agencia VARCHAR(100) NOT NULL,
    tipo_agencia VARCHAR(20) NOT NULL CHECK (tipo_agencia IN ('FISICA', 'DIGITAL')),
    endereco VARCHAR(200),
    cidade VARCHAR(100),
    estado CHAR(2),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operacional.tabela_produtos (
    produto_id BIGINT PRIMARY KEY,
    codigo_produto VARCHAR(20) NOT NULL UNIQUE,
    nome_produto VARCHAR(100) NOT NULL,
    categoria_produto VARCHAR(50) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operacional.tabela_contas (
    conta_id BIGINT PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES operacional.tabela_clientes(cliente_id),
    agencia_id BIGINT NOT NULL REFERENCES operacional.tabela_agencias(agencia_id),
    produto_id BIGINT NOT NULL REFERENCES operacional.tabela_produtos(produto_id),
    numero_conta VARCHAR(20) NOT NULL,
    digito_conta CHAR(1) NOT NULL,
    saldo_atual NUMERIC(15,2) NOT NULL DEFAULT 0,
    limite_credito NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (limite_credito >= 0),
    status_conta VARCHAR(20) NOT NULL CHECK (status_conta IN ('ATIVA', 'ENCERRADA', 'BLOQUEADA')),
    data_abertura DATE NOT NULL,
    data_encerramento DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_conta_agencia_numero UNIQUE (agencia_id, numero_conta, digito_conta),
    CONSTRAINT ck_data_encerramento CHECK (
        data_encerramento IS NULL OR data_encerramento >= data_abertura
    )
);

CREATE TABLE operacional.tabela_transacoes (
    transacao_id BIGINT PRIMARY KEY,
    codigo_transacao UUID NOT NULL UNIQUE,
    conta_origem_id BIGINT REFERENCES operacional.tabela_contas(conta_id),
    conta_destino_id BIGINT REFERENCES operacional.tabela_contas(conta_id),
    tipo_transacao VARCHAR(30) NOT NULL CHECK (
        tipo_transacao IN ('PIX', 'TED', 'SAQUE', 'DEPOSITO', 'PAGAMENTO', 'TARIFA')
    ),
    canal VARCHAR(30) NOT NULL CHECK (canal IN ('APP', 'INTERNET_BANKING', 'AGENCIA', 'ATM')),
    valor NUMERIC(15,2) NOT NULL CHECK (valor > 0),
    moeda CHAR(3) NOT NULL DEFAULT 'BRL',
    data_hora_transacao TIMESTAMP NOT NULL,
    status_transacao VARCHAR(20) NOT NULL CHECK (
        status_transacao IN ('APROVADA', 'REJEITADA', 'PENDENTE')
    ),
    codigo_autorizacao VARCHAR(50),
    descricao VARCHAR(255),
    ip_origem VARCHAR(45),
    dispositivo_id VARCHAR(100),
    data_processamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_transacao_tem_conta CHECK (
        conta_origem_id IS NOT NULL OR conta_destino_id IS NOT NULL
    ),
    CONSTRAINT ck_transacao_contas_diferentes CHECK (
        conta_origem_id IS NULL
        OR conta_destino_id IS NULL
        OR conta_origem_id <> conta_destino_id
    )
);

CREATE TABLE auditoria.registros_rejeitados (
    rejeicao_id BIGSERIAL PRIMARY KEY,
    origem VARCHAR(100) NOT NULL,
    linha INTEGER,
    motivo TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contas_cliente_id ON operacional.tabela_contas(cliente_id);
CREATE INDEX idx_contas_agencia_id ON operacional.tabela_contas(agencia_id);
CREATE INDEX idx_contas_produto_id ON operacional.tabela_contas(produto_id);
CREATE INDEX idx_transacoes_origem_id ON operacional.tabela_transacoes(conta_origem_id);
CREATE INDEX idx_transacoes_destino_id ON operacional.tabela_transacoes(conta_destino_id);
CREATE INDEX idx_transacoes_data_hora ON operacional.tabela_transacoes(data_hora_transacao);
CREATE INDEX idx_transacoes_status ON operacional.tabela_transacoes(status_transacao);
CREATE INDEX idx_transacoes_tipo ON operacional.tabela_transacoes(tipo_transacao);
