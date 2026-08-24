-- ============================================
-- 006 - RECURSOS.sql
-- Sistema de Oficina Mecânica
-- ============================================

USE oficina_mecanica;


-- ============================================
-- VIEW: CLIENTES E VEÍCULOS
-- ============================================

CREATE OR REPLACE VIEW vw_clientes_veiculos AS
SELECT
    c.id_cliente,
    c.nome_cliente,
    c.cpf,
    c.telefone,
    c.email,
    c.endereco,

    v.id_veiculo,
    v.placa,
    v.marca,
    v.modelo,
    v.ano,
    v.cor,
    v.quilometragem

FROM cliente c

INNER JOIN veiculo v
    ON c.id_cliente = v.id_cliente;


-- ============================================
-- VIEW: ORDENS DE SERVIÇO COMPLETAS
-- ============================================

CREATE OR REPLACE VIEW vw_ordens_servico AS
SELECT
    os.id_os,
    os.data_entrada,
    os.data_previsao,
    os.data_entrega,
    os.status AS status_os,
    os.observacoes,
    os.valor_total,

    c.id_cliente,
    c.nome_cliente,
    c.cpf,
    c.telefone,
    c.email,

    v.id_veiculo,
    v.placa,
    v.marca,
    v.modelo,
    v.ano,
    v.cor,
    v.quilometragem

FROM ordem_servico os

INNER JOIN cliente c
    ON os.id_cliente = c.id_cliente

INNER JOIN veiculo v
    ON os.id_veiculo = v.id_veiculo;


-- ============================================
-- VIEW: PROBLEMAS E SERVIÇOS
-- ============================================

CREATE OR REPLACE VIEW vw_problemas_servicos AS
SELECT
    p.id_problema,
    p.id_os,
    p.descricao_prob,
    p.prioridade,
    p.status AS status_problema,

    s.id_servico,
    s.descricao_serv,
    s.tempo_estimado,
    s.valor_mao_obra

FROM problema p

LEFT JOIN servico s
    ON p.id_problema = s.id_problema;


-- ============================================
-- VIEW: ITENS DA ORDEM DE SERVIÇO
-- ============================================

CREATE OR REPLACE VIEW vw_itens_os AS
SELECT
    i.id_item,
    i.id_os,
    i.quantidade,
    i.valor_unitario,
    i.valor_total,

    s.id_servico,
    s.descricao_serv,
    s.tempo_estimado,
    s.valor_mao_obra,

    p.id_peca,
    p.nome_peca,
    p.descricao_peca,
    p.preco_unitario,
    p.estoque

FROM item_os i

LEFT JOIN servico s
    ON i.id_servico = s.id_servico

LEFT JOIN peca p
    ON i.id_peca = p.id_peca;


-- ============================================
-- VIEW: PAGAMENTOS
-- ============================================

CREATE OR REPLACE VIEW vw_pagamentos AS
SELECT
    pg.id_pagamento,
    pg.forma_pagamento,
    pg.valor AS valor_pagamento,
    pg.status AS status_pagamento,
    pg.data_pagamento,

    os.id_os,
    os.status AS status_os,
    os.valor_total,

    c.id_cliente,
    c.nome_cliente

FROM pagamento pg

INNER JOIN ordem_servico os
    ON pg.id_os = os.id_os

INNER JOIN cliente c
    ON os.id_cliente = c.id_cliente;


-- ============================================
-- VIEW: FUNCIONÁRIOS E LOGIN
-- ============================================

CREATE OR REPLACE VIEW vw_funcionarios_login AS
SELECT
    f.id_funcionario,
    f.nome_funcionario,
    f.especialidade,
    f.telefone,

    l.id_login,
    l.usuario,
    l.ultimo_login

FROM funcionario f

LEFT JOIN login l
    ON f.id_login = l.id_login;


-- ============================================
-- VIEW: EXECUÇÕES DOS FUNCIONÁRIOS
-- ============================================

CREATE OR REPLACE VIEW vw_execucoes AS
SELECT
    e.id_execucao,
    e.data_inicio,
    e.data_fim,
    e.status AS status_execucao,

    f.id_funcionario,
    f.nome_funcionario,
    f.especialidade,
    f.telefone

FROM execucao e

INNER JOIN funcionario f
    ON e.id_funcionario = f.id_funcionario;


-- ============================================
-- PROCEDURE:
-- BUSCAR ORDEM DE SERVIÇO PELO ID
-- ============================================

DROP PROCEDURE IF EXISTS buscar_ordem_servico;

DELIMITER $$

CREATE PROCEDURE buscar_ordem_servico(
    IN p_id_os INT
)
BEGIN

    SELECT
        os.id_os,
        os.data_entrada,
        os.data_previsao,
        os.data_entrega,
        os.status,
        os.observacoes,
        os.valor_total,

        c.id_cliente,
        c.nome_cliente,
        c.cpf,
        c.telefone,
        c.email,

        v.id_veiculo,
        v.placa,
        v.marca,
        v.modelo,
        v.ano,
        v.cor,
        v.quilometragem

    FROM ordem_servico os

    INNER JOIN cliente c
        ON os.id_cliente = c.id_cliente

    INNER JOIN veiculo v
        ON os.id_veiculo = v.id_veiculo

    WHERE os.id_os = p_id_os;

END $$

DELIMITER ;


-- ============================================
-- PROCEDURE:
-- BUSCAR ORDENS POR STATUS
-- ============================================

DROP PROCEDURE IF EXISTS buscar_ordens_status;

DELIMITER $$

CREATE PROCEDURE buscar_ordens_status(
    IN p_status VARCHAR(50)
)
BEGIN

    SELECT
        os.id_os,
        os.id_cliente,
        os.id_veiculo,
        os.data_entrada,
        os.data_previsao,
        os.data_entrega,
        os.status,
        os.observacoes,
        os.valor_total

    FROM ordem_servico os

    WHERE os.status = p_status;

END $$

DELIMITER ;


-- ============================================
-- PROCEDURE:
-- BUSCAR VEÍCULOS DE UM CLIENTE
-- ============================================

DROP PROCEDURE IF EXISTS buscar_veiculos_cliente;

DELIMITER $$

CREATE PROCEDURE buscar_veiculos_cliente(
    IN p_id_cliente INT
)
BEGIN

    SELECT
        v.id_veiculo,
        v.id_cliente,
        v.placa,
        v.marca,
        v.modelo,
        v.ano,
        v.cor,
        v.quilometragem

    FROM veiculo v

    WHERE v.id_cliente = p_id_cliente;

END $$

DELIMITER ;


-- ============================================
-- PROCEDURE:
-- BUSCAR PROBLEMAS DE UMA ORDEM
-- ============================================

DROP PROCEDURE IF EXISTS buscar_problemas_os;

DELIMITER $$

CREATE PROCEDURE buscar_problemas_os(
    IN p_id_os INT
)
BEGIN

    SELECT
        p.id_problema,
        p.id_os,
        p.descricao_prob,
        p.prioridade,
        p.status,
        p.id_execucao

    FROM problema p

    WHERE p.id_os = p_id_os;

END $$

DELIMITER ;


-- ============================================
-- PROCEDURE:
-- ATUALIZAR STATUS DA ORDEM
-- ============================================

DROP PROCEDURE IF EXISTS atualizar_status_os;

DELIMITER $$

CREATE PROCEDURE atualizar_status_os(
    IN p_id_os INT,
    IN p_status VARCHAR(50)
)
BEGIN

    UPDATE ordem_servico
    SET status = p_status
    WHERE id_os = p_id_os;

END $$

DELIMITER ;


-- ============================================
-- PROCEDURE:
-- ATUALIZAR VALOR DA ORDEM
-- ============================================

DROP PROCEDURE IF EXISTS atualizar_valor_os;

DELIMITER $$

CREATE PROCEDURE atualizar_valor_os(
    IN p_id_os INT,
    IN p_valor_total DECIMAL(10,2)
)
BEGIN

    UPDATE ordem_servico
    SET valor_total = p_valor_total
    WHERE id_os = p_id_os;

END $$

DELIMITER ;


-- ============================================
-- PROCEDURE:
-- ATUALIZAR STATUS DO PAGAMENTO
-- ============================================

DROP PROCEDURE IF EXISTS atualizar_status_pagamento;

DELIMITER $$

CREATE PROCEDURE atualizar_status_pagamento(
    IN p_id_pagamento INT,
    IN p_status VARCHAR(50)
)
BEGIN

    UPDATE pagamento
    SET status = p_status
    WHERE id_pagamento = p_id_pagamento;

END $$

DELIMITER ;


-- ============================================
-- EXEMPLOS DE UTILIZAÇÃO
-- ============================================

-- Buscar OS pelo ID:
-- CALL buscar_ordem_servico(1);

-- Buscar ordens em andamento:
-- CALL buscar_ordens_status('Em andamento');

-- Buscar veículos do cliente 1:
-- CALL buscar_veiculos_cliente(1);

-- Buscar problemas da OS 1:
-- CALL buscar_problemas_os(1);

-- Alterar status da OS:
-- CALL atualizar_status_os(1, 'Concluída');

-- Alterar valor da OS:
-- CALL atualizar_valor_os(1, 500.00);

-- Alterar status do pagamento:
-- CALL atualizar_status_pagamento(1, 'Pago');