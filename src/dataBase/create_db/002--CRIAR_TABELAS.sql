-- ============================================
-- 002 - CRIAR_TABELAS.sql
-- Sistema de Oficina Mecânica
-- ============================================

USE oficina_mecanica;


-- ============================================
-- TABELA CLIENTE
-- ============================================

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome_cliente VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150),
    endereco VARCHAR(255)
);


-- ============================================
-- TABELA VEICULO
-- ============================================

CREATE TABLE IF NOT EXISTS veiculo (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    placa VARCHAR(10) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INT,
    cor VARCHAR(50),
    quilometragem INT
);


-- ============================================
-- TABELA ORDEM_SERVICO
-- ============================================

CREATE TABLE IF NOT EXISTS ordem_servico (
    id_os INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_veiculo INT NOT NULL,
    data_entrada DATETIME NOT NULL,
    data_previsao DATETIME,
    data_entrega DATETIME,
    status VARCHAR(50) NOT NULL,
    observacoes TEXT,
    valor_total DECIMAL(10,2) DEFAULT 0.00
);


-- ============================================
-- TABELA PAGAMENTO
-- ============================================

CREATE TABLE IF NOT EXISTS pagamento (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    id_os INT NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    data_pagamento DATETIME
);


-- ============================================
-- TABELA PECA
-- ============================================

CREATE TABLE IF NOT EXISTS peca (
    id_peca INT AUTO_INCREMENT PRIMARY KEY,
    nome_peca VARCHAR(150) NOT NULL,
    descricao_peca TEXT,
    preco_unitario DECIMAL(10,2) NOT NULL,
    estoque INT DEFAULT 0
);


-- ============================================
-- TABELA ITEM_OS
-- ============================================

CREATE TABLE IF NOT EXISTS item_os (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_os INT NOT NULL,
    id_servico INT,
    id_peca INT,
    quantidade INT DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL
);


-- ============================================
-- TABELA SERVICO
-- ============================================

CREATE TABLE IF NOT EXISTS servico (
    id_servico INT AUTO_INCREMENT PRIMARY KEY,
    id_problema INT NOT NULL,
    descricao_serv TEXT NOT NULL,
    tempo_estimado INT,
    valor_mao_obra DECIMAL(10,2) DEFAULT 0.00
);


-- ============================================
-- TABELA PROBLEMA
-- ============================================

CREATE TABLE IF NOT EXISTS problema (
    id_problema INT AUTO_INCREMENT PRIMARY KEY,
    id_os INT NOT NULL,
    descricao_prob TEXT NOT NULL,
    prioridade VARCHAR(30),
    status VARCHAR(50),
    id_execucao INT
);


-- ============================================
-- TABELA FUNCIONARIO
-- ============================================

CREATE TABLE IF NOT EXISTS funcionario (
    id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    id_login INT,
    nome_funcionario VARCHAR(150) NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20)
);


-- ============================================
-- TABELA LOGIN
-- ============================================

CREATE TABLE IF NOT EXISTS login (
    id_login INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT,
    usuario VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    ultimo_login DATETIME
);


-- ============================================
-- TABELA EXECUCAO
-- ============================================

CREATE TABLE IF NOT EXISTS execucao (
    id_execucao INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT NOT NULL,
    data_inicio DATETIME,
    data_fim DATETIME,
    status VARCHAR(50)
);