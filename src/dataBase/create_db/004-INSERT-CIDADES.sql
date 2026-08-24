-- ============================================
-- 004 - INSERT_REGISTROS.sql
-- Sistema de Oficina Mecânica
-- ============================================

USE oficina_mecanica;


-- ============================================
-- CLIENTES
-- ============================================

INSERT INTO cliente
(nome_cliente, cpf, telefone, email, endereco)
VALUES
(
    'João da Silva',
    '123.456.789-01',
    '(11) 99999-1111',
    'joao@email.com',
    'Rua das Flores, 100'
),
(
    'Maria Oliveira',
    '987.654.321-00',
    '(11) 98888-2222',
    'maria@email.com',
    'Avenida Brasil, 250'
),
(
    'Carlos Souza',
    '456.789.123-45',
    '(11) 97777-3333',
    'carlos@email.com',
    'Rua Central, 50'
);


-- ============================================
-- VEÍCULOS
-- ============================================

INSERT INTO veiculo
(id_cliente, placa, marca, modelo, ano, cor, quilometragem)
VALUES
(
    1,
    'ABC1D23',
    'Chevrolet',
    'Onix',
    2023,
    'Branco',
    25000
),
(
    2,
    'DEF4G56',
    'Volkswagen',
    'Gol',
    2020,
    'Prata',
    52000
),
(
    3,
    'GHI7J89',
    'Fiat',
    'Argo',
    2022,
    'Preto',
    31000
);


-- ============================================
-- PEÇAS
-- ============================================

INSERT INTO peca
(nome_peca, descricao_peca, preco_unitario, estoque)
VALUES
(
    'Pastilha de Freio',
    'Jogo de pastilhas de freio dianteiras',
    150.00,
    20
),
(
    'Filtro de Óleo',
    'Filtro de óleo do motor',
    45.00,
    30
),
(
    'Óleo 5W30',
    'Óleo lubrificante para motor',
    55.00,
    50
),
(
    'Correia Dentada',
    'Correia dentada do motor',
    180.00,
    15
);


-- ============================================
-- LOGIN
-- Primeiro criamos sem funcionário
-- ============================================

INSERT INTO login
(id_funcionario, usuario, senha_hash, ultimo_login)
VALUES
(
    NULL,
    'admin',
    '$2b$10$senha_hash_exemplo',
    NULL
);


-- ============================================
-- FUNCIONÁRIO
-- ============================================

INSERT INTO funcionario
(id_login, nome_funcionario, especialidade, telefone)
VALUES
(
    1,
    'Pedro Santos',
    'Mecânico',
    '(11) 96666-4444'
);


-- ============================================
-- LIGAR LOGIN AO FUNCIONÁRIO
-- ============================================

UPDATE login
SET id_funcionario = 1
WHERE id_login = 1;


-- ============================================
-- ORDEM DE SERVIÇO
-- ============================================

INSERT INTO ordem_servico
(
    id_cliente,
    id_veiculo,
    data_entrada,
    data_previsao,
    data_entrega,
    status,
    observacoes,
    valor_total
)
VALUES
(
    1,
    1,
    '2026-08-20 08:30:00',
    '2026-08-22 17:00:00',
    NULL,
    'Em andamento',
    'Problema identificado no sistema de freio.',
    350.00
);


-- ============================================
-- EXECUÇÃO
-- ============================================

INSERT INTO execucao
(
    id_funcionario,
    data_inicio,
    data_fim,
    status
)
VALUES
(
    1,
    '2026-08-20 09:00:00',
    NULL,
    'Em andamento'
);


-- ============================================
-- PROBLEMA
-- ============================================

INSERT INTO problema
(
    id_os,
    descricao_prob,
    prioridade,
    status,
    id_execucao
)
VALUES
(
    1,
    'Ruído ao frear e baixa eficiência do sistema de freio.',
    'Alta',
    'Em análise',
    1
);


-- ============================================
-- SERVIÇO
-- ============================================

INSERT INTO servico
(
    id_problema,
    descricao_serv,
    tempo_estimado,
    valor_mao_obra
)
VALUES
(
    1,
    'Troca das pastilhas de freio dianteiras',
    60,
    200.00
);


-- ============================================
-- ITEM DA ORDEM DE SERVIÇO
-- ============================================

INSERT INTO item_os
(
    id_os,
    id_servico,
    id_peca,
    quantidade,
    valor_unitario,
    valor_total
)
VALUES
(
    1,
    1,
    1,
    1,
    150.00,
    350.00
);


-- ============================================
-- PAGAMENTO
-- ============================================

INSERT INTO pagamento
(
    id_os,
    forma_pagamento,
    valor,
    status,
    data_pagamento
)
VALUES
(
    1,
    'Pix',
    350.00,
    'Pendente',
    NULL
);