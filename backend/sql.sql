
-- BANCO DE DADOS METAPAY

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'usuario'
        CHECK (perfil IN ('usuario', 'admin')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL
        REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('entrada', 'saida')),
    valor NUMERIC(12,2) NOT NULL
        CHECK (valor > 0),
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transacoes_usuario
ON transacoes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_transacoes_data
ON transacoes(data_transacao);

CREATE INDEX IF NOT EXISTS idx_transacoes_categoria
ON transacoes(categoria);
