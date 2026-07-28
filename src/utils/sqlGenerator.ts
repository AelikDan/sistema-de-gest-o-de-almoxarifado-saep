import { INITIAL_CATEGORIES, INITIAL_MOVEMENTS, INITIAL_PRODUCTS, INITIAL_USERS } from '../data/initialData';

export function generateSaepDbSqlScript(): string {
  return `-- =================================================================
-- SISTEMA DE AVALIAÇÃO DA EDUCAÇÃO PROFISSIONAL (SAEP)
-- PROVA PRÁTICA: SISTEMA DE GESTÃO DE ALMOXARIFADO DE FERRAMENTAS
-- NOME DO BANCO DE DADOS: saep_db
-- DATA DE GERAÇÃO: 2026-07-28
-- =================================================================

-- 1. CRIAÇÃO DO BANCO DE DADOS E SCHEMAS
CREATE DATABASE saep_db
  WITH 
  OWNER = postgres
  ENCODING = 'UTF8'
  CONNECTION LIMIT = -1;

\\c saep_db;

-- 2. LIMPEZA DE TABELAS EXISTENTES (CASCATA)
DROP TABLE IF EXISTS tb_movimentacoes CASCADE;
DROP TABLE IF EXISTS tb_produtos CASCADE;
DROP TABLE IF EXISTS tb_categorias CASCADE;
DROP TABLE IF EXISTS tb_usuarios CASCADE;

-- 3. CRIAÇÃO DAS TABELAS

-- Tabla de Usuários
CREATE TABLE tb_usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP
);

-- Tabela de Categorias de Ferramentas
CREATE TABLE tb_categorias (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    descricao TEXT
);

-- Tabela de Produtos (Ferramentas e Equipamentos)
CREATE TABLE tb_produtos (
    id_produto SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(120) NOT NULL,
    id_categoria INT NOT NULL,
    material_cabeca_haste VARCHAR(100) NOT NULL,
    material_cabo VARCHAR(100) NOT NULL,
    revestimento_isolante BOOLEAN DEFAULT FALSE,
    ponta_imantada BOOLEAN DEFAULT FALSE,
    tamanho VARCHAR(50) NOT NULL,
    peso_gramas NUMERIC(10, 2) NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    estoque_minimo INT NOT NULL DEFAULT 0,
    estoque_atual INT NOT NULL DEFAULT 0,
    localizacao_prateleira VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) 
        REFERENCES tb_categorias(id_categoria) ON DELETE RESTRICT
);

-- Tabela de Histórico de Movimentações de Estoque
CREATE TABLE tb_movimentacoes (
    id_movimentacao SERIAL PRIMARY KEY,
    id_produto INT NOT NULL,
    tipo_movimentacao VARCHAR(10) CHECK (tipo_movimentacao IN ('Entrada', 'Saída')),
    quantidade INT NOT NULL,
    estoque_anterior INT NOT NULL,
    estoque_novo INT NOT NULL,
    estoque_minimo_momento INT NOT NULL,
    id_usuario INT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,
    alerta_gerado BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_movimentacao_produto FOREIGN KEY (id_produto) 
        REFERENCES tb_produtos(id_produto) ON DELETE CASCADE,
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (id_usuario) 
        REFERENCES tb_usuarios(id_usuario) ON DELETE RESTRICT
);

-- ÍNDICES PARA OTIMIZAÇÃO DE BUSCA E ORDENAÇÃO
CREATE INDEX idx_produtos_nome ON tb_produtos(nome);
CREATE INDEX idx_produtos_codigo ON tb_produtos(codigo);
CREATE INDEX idx_movimentacoes_data ON tb_movimentacoes(data_hora DESC);


-- 4. INSERÇÃO DE DADOS INICIAIS (POPULAÇÃO DO BANCO)

-- 4.1 Inserindo Registros na Tabela de Usuários (Mínimo de 3 registros)
${INITIAL_USERS.map(
  (u) =>
    `INSERT INTO tb_usuarios (id_usuario, nome, email, senha, cargo, ativo, ultimo_acesso) 
VALUES (${u.id}, '${u.nome}', '${u.email}', '${u.senha}', '${u.cargo}', ${u.ativo ? 'TRUE' : 'FALSE'}, '${u.ultimoAcesso}');`
).join('\n')}

-- 4.2 Inserindo Registros na Tabela de Categorias (Mínimo de 3 registros)
${INITIAL_CATEGORIES.map(
  (c) =>
    `INSERT INTO tb_categorias (id_categoria, nome, descricao) 
VALUES (${c.id}, '${c.nome.replace(/'/g, "''")}', '${c.descricao.replace(/'/g, "''")}');`
).join('\n')}

-- 4.3 Inserindo Registros na Tabela de Produtos (Mínimo de 3 registros)
${INITIAL_PRODUCTS.map(
  (p) =>
    `INSERT INTO tb_produtos (id_produto, codigo, nome, id_categoria, material_cabeca_haste, material_cabo, revestimento_isolante, ponta_imantada, tamanho, peso_gramas, preco_unitario, estoque_minimo, estoque_atual, localizacao_prateleira, data_cadastro) 
VALUES (${p.id}, '${p.codigo}', '${p.nome.replace(/'/g, "''")}', ${p.categoriaId}, '${p.materialCabecaHaste.replace(/'/g, "''")}', '${p.materialCabo.replace(/'/g, "''")}', ${p.revestimentoIsolante ? 'TRUE' : 'FALSE'}, ${p.pontaImantada ? 'TRUE' : 'FALSE'}, '${p.tamanho}', ${p.peso}, ${p.precoUnitario}, ${p.estoqueMinimo}, ${p.estoqueAtual}, '${p.localizacaoPrateleira}', '${p.dataCadastro}');`
).join('\n')}

-- 4.4 Inserindo Registros na Tabela de Movimentações (Mínimo de 3 registros)
${INITIAL_MOVEMENTS.map(
  (m) =>
    `INSERT INTO tb_movimentacoes (id_movimentacao, id_produto, tipo_movimentacao, quantidade, estoque_anterior, estoque_novo, estoque_minimo_momento, id_usuario, data_hora, observacao, alerta_gerado) 
VALUES (${m.id}, ${m.produtoId}, '${m.tipo}', ${m.quantidade}, ${m.estoqueAnterior}, ${m.estoqueNovo}, ${m.estoqueMinimo}, ${m.usuarioId}, '${m.dataHora}', '${m.observacao?.replace(/'/g, "''") || ''}', ${m.alertaGerado ? 'TRUE' : 'FALSE'});`
).join('\n')}

-- AJUSTE DE SEQUÊNCIAS PARA AUTO_INCREMENT
SELECT setval('tb_usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM tb_usuarios));
SELECT setval('tb_categorias_id_categoria_seq', (SELECT MAX(id_categoria) FROM tb_categorias));
SELECT setval('tb_produtos_id_produto_seq', (SELECT MAX(id_produto) FROM tb_produtos));
SELECT setval('tb_movimentacoes_id_movimentacao_seq', (SELECT MAX(id_movimentacao) FROM tb_movimentacoes));

-- FIM DO SCRIPT DE CRIAÇÃO E POPULAÇÃO
`;
}
