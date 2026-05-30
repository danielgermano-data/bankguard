CREATE TABLE IF NOT EXISTS dw.dim_cliente (
    cliente_sk BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL UNIQUE,
    cpf CHAR(11) NOT NULL,
    nome_completo VARCHAR(150) NOT NULL,
    faixa_renda VARCHAR(30) NOT NULL,
    faixa_risco VARCHAR(30) NOT NULL,
    status_cliente VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.dim_agencia (
    agencia_sk BIGSERIAL PRIMARY KEY,
    agencia_id BIGINT NOT NULL UNIQUE,
    codigo_agencia VARCHAR(10) NOT NULL,
    nome_agencia VARCHAR(100) NOT NULL,
    tipo_agencia VARCHAR(20) NOT NULL,
    cidade VARCHAR(100),
    estado CHAR(2)
);

CREATE TABLE IF NOT EXISTS dw.dim_produto (
    produto_sk BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL UNIQUE,
    codigo_produto VARCHAR(20) NOT NULL,
    nome_produto VARCHAR(100) NOT NULL,
    categoria_produto VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.dim_conta (
    conta_sk BIGSERIAL PRIMARY KEY,
    conta_id BIGINT NOT NULL UNIQUE,
    numero_conta VARCHAR(20) NOT NULL,
    status_conta VARCHAR(20) NOT NULL,
    data_abertura DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.dim_tempo (
    tempo_sk INTEGER PRIMARY KEY,
    data_completa DATE NOT NULL UNIQUE,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    dia INTEGER NOT NULL,
    nome_mes VARCHAR(20) NOT NULL,
    trimestre INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.fato_transacoes (
    transacao_id BIGINT PRIMARY KEY,
    cliente_sk BIGINT NOT NULL REFERENCES dw.dim_cliente(cliente_sk),
    conta_origem_sk BIGINT REFERENCES dw.dim_conta(conta_sk),
    conta_destino_sk BIGINT REFERENCES dw.dim_conta(conta_sk),
    agencia_sk BIGINT NOT NULL REFERENCES dw.dim_agencia(agencia_sk),
    produto_sk BIGINT NOT NULL REFERENCES dw.dim_produto(produto_sk),
    tempo_sk INTEGER NOT NULL REFERENCES dw.dim_tempo(tempo_sk),
    tipo_transacao VARCHAR(30) NOT NULL,
    canal VARCHAR(30) NOT NULL,
    status_transacao VARCHAR(20) NOT NULL,
    valor NUMERIC(15,2) NOT NULL,
    flag_suspeita BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_suspeita VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_fato_tempo ON dw.fato_transacoes(tempo_sk);
CREATE INDEX IF NOT EXISTS idx_fato_cliente ON dw.fato_transacoes(cliente_sk);
CREATE INDEX IF NOT EXISTS idx_fato_agencia ON dw.fato_transacoes(agencia_sk);
CREATE INDEX IF NOT EXISTS idx_fato_produto ON dw.fato_transacoes(produto_sk);
CREATE INDEX IF NOT EXISTS idx_fato_suspeita ON dw.fato_transacoes(flag_suspeita);
