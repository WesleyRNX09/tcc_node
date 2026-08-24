-- ============================================
-- 005 - CONSULTAS_TESTE.sql
-- Sistema de Oficina Mecânica
-- ============================================

USE oficina_mecanica;


-- ============================================
-- LISTAR CLIENTES
-- ============================================

SELECT
    id_cliente,
    nome_cliente,
    cpf,
    telefone,
    email,
    endereco
FROM cliente;


-- ============================================
-- LISTAR VEÍCULOS
-- ============================================

SELECT
    id_veiculo,
    id_cliente,
    placa,
    marca,
    modelo,
    ano,
    cor,
    quilometragem
FROM veiculo;


-- ============================================
-- CLIENTES COM SEUS VEÍCULOS
-- ============================================

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
-- LISTAR ORDENS DE SERVIÇO
-- ============================================

SELECT
    id_os,
    id_cliente,
    id_veiculo,
    data_entrada,
    data_previsao,
    data_entrega,
    status,
    observacoes,
    valor_total
FROM ordem_servico;


-- ============================================
-- ORDEM DE SERVIÇO + CLIENTE + VEÍCULO
-- ============================================

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
    c.endereco,

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
-- LISTAR PROBLEMAS
-- ============================================

SELECT
    id_problema,
    id_os,
    descricao_prob,
    prioridade,
    status,
    id_execucao
FROM problema;


-- ============================================
-- PROBLEMAS + ORDEM DE SERVIÇO
-- ============================================

SELECT
    p.id_problema,
    p.descricao_prob,
    p.prioridade,
    p.status,
    p.id_execucao,

    os.id_os,
    os.data_entrada,
    os.data_previsao,
    os.data_entrega,
    os.status AS status_os,
    os.observacoes,
    os.valor_total

FROM problema p

INNER JOIN ordem_servico os
    ON p.id_os = os.id_os;


-- ============================================
-- LISTAR SERVIÇOS
-- ============================================

SELECT
    id_servico,
    id_problema,
    descricao_serv,
    tempo_estimado,
    valor_mao_obra
FROM servico;


-- ============================================
-- SERVIÇOS + PROBLEMAS
-- ============================================

SELECT
    s.id_servico,
    s.descricao_serv,
    s.tempo_estimado,
    s.valor_mao_obra,

    p.id_problema,
    p.descricao_prob,
    p.prioridade,
    p.status

FROM servico s

INNER JOIN problema p
    ON s.id_problema = p.id_problema;


-- ============================================
-- LISTAR PEÇAS
-- ============================================

SELECT
    id_peca,
    nome_peca,
    descricao_peca,
    preco_unitario,
    estoque
FROM peca;


-- ============================================
-- LISTAR ITENS DA ORDEM DE SERVIÇO
-- ============================================

SELECT
    id_item,
    id_os,
    id_servico,
    id_peca,
    quantidade,
    valor_unitario,
    valor_total
FROM item_os;


-- ============================================
-- ITENS DA OS + SERVIÇO + PEÇA
-- ============================================

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
-- LISTAR PAGAMENTOS
-- ============================================

SELECT
    id_pagamento,
    id_os,
    forma_pagamento,
    valor,
    status,
    data_pagamento
FROM pagamento;


-- ============================================
-- PAGAMENTO + ORDEM DE SERVIÇO
-- ============================================

SELECT
    pg.id_pagamento,
    pg.forma_pagamento,
    pg.valor,
    pg.status,
    pg.data_pagamento,

    os.id_os,
    os.data_entrada,
    os.data_previsao,
    os.data_entrega,
    os.status AS status_os,
    os.valor_total

FROM pagamento pg

INNER JOIN ordem_servico os
    ON pg.id_os = os.id_os;


-- ============================================
-- LISTAR FUNCIONÁRIOS
-- ============================================

SELECT
    id_funcionario,
    id_login,
    nome_funcionario,
    especialidade,
    telefone
FROM funcionario;


-- ============================================
-- LISTAR LOGINS
-- ============================================

SELECT
    id_login,
    id_funcionario,
    usuario,
    senha_hash,
    ultimo_login
FROM login;


-- ============================================
-- FUNCIONÁRIO + LOGIN
-- ============================================

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
-- LISTAR EXECUÇÕES
-- ============================================

SELECT
    id_execucao,
    id_funcionario,
    data_inicio,
    data_fim,
    status
FROM execucao;


-- ============================================
-- EXECUÇÃO + FUNCIONÁRIO
-- ============================================

SELECT
    e.id_execucao,
    e.data_inicio,
    e.data_fim,
    e.status,

    f.id_funcionario,
    f.nome_funcionario,
    f.especialidade,
    f.telefone

FROM execucao e

INNER JOIN funcionario f
    ON e.id_funcionario = f.id_funcionario;


-- ============================================
-- QUANTIDADE TOTAL DE CLIENTES
-- ============================================

SELECT
    COUNT(id_cliente) AS total_clientes
FROM cliente;


-- ============================================
-- QUANTIDADE TOTAL DE VEÍCULOS
-- ============================================

SELECT
    COUNT(id_veiculo) AS total_veiculos
FROM veiculo;


-- ============================================
-- QUANTIDADE TOTAL DE ORDENS
-- ============================================

SELECT
    COUNT(id_os) AS total_ordens
FROM ordem_servico;


-- ============================================
-- VALOR TOTAL DAS ORDENS
-- ============================================

SELECT
    SUM(valor_total) AS valor_total_ordens
FROM ordem_servico;


-- ============================================
-- ORDENS AGRUPADAS POR STATUS
-- ============================================

SELECT
    status,
    COUNT(id_os) AS quantidade
FROM ordem_servico
GROUP BY status;


-- ============================================
-- PEÇAS COM ESTOQUE
-- ============================================

SELECT
    id_peca,
    nome_peca,
    preco_unitario,
    estoque
FROM peca
WHERE estoque > 0;


-- ============================================
-- ORDENS EM ANDAMENTO
-- ============================================

SELECT
    id_os,
    id_cliente,
    id_veiculo,
    data_entrada,
    data_previsao,
    data_entrega,
    status,
    observacoes,
    valor_total
FROM ordem_servico
WHERE status = 'Em andamento';


-- ============================================
-- PAGAMENTOS PENDENTES
-- ============================================

SELECT
    id_pagamento,
    id_os,
    forma_pagamento,
    valor,
    status,
    data_pagamento
FROM pagamento
WHERE status = 'Pendente';