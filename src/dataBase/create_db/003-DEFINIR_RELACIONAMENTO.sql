-- ============================================
-- 003 - DEFINIR_RELACIONAMENTOS.sql
-- Sistema de Oficina Mecânica
-- ============================================

USE oficina_mecanica;


-- ============================================
-- VEICULO -> CLIENTE
-- Um cliente pode possuir vários veículos
-- ============================================

ALTER TABLE veiculo
ADD CONSTRAINT fk_veiculo_cliente
FOREIGN KEY (id_cliente)
REFERENCES cliente(id_cliente);


-- ============================================
-- ORDEM_SERVICO -> CLIENTE
-- ============================================

ALTER TABLE ordem_servico
ADD CONSTRAINT fk_os_cliente
FOREIGN KEY (id_cliente)
REFERENCES cliente(id_cliente);


-- ============================================
-- ORDEM_SERVICO -> VEICULO
-- ============================================

ALTER TABLE ordem_servico
ADD CONSTRAINT fk_os_veiculo
FOREIGN KEY (id_veiculo)
REFERENCES veiculo(id_veiculo);


-- ============================================
-- PAGAMENTO -> ORDEM_SERVICO
-- ============================================

ALTER TABLE pagamento
ADD CONSTRAINT fk_pagamento_os
FOREIGN KEY (id_os)
REFERENCES ordem_servico(id_os);


-- ============================================
-- ITEM_OS -> ORDEM_SERVICO
-- ============================================

ALTER TABLE item_os
ADD CONSTRAINT fk_item_os
FOREIGN KEY (id_os)
REFERENCES ordem_servico(id_os);


-- ============================================
-- ITEM_OS -> SERVICO
-- ============================================

ALTER TABLE item_os
ADD CONSTRAINT fk_item_servico
FOREIGN KEY (id_servico)
REFERENCES servico(id_servico);


-- ============================================
-- ITEM_OS -> PECA
-- ============================================

ALTER TABLE item_os
ADD CONSTRAINT fk_item_peca
FOREIGN KEY (id_peca)
REFERENCES peca(id_peca);


-- ============================================
-- SERVICO -> PROBLEMA
-- ============================================

ALTER TABLE servico
ADD CONSTRAINT fk_servico_problema
FOREIGN KEY (id_problema)
REFERENCES problema(id_problema);


-- ============================================
-- PROBLEMA -> ORDEM_SERVICO
-- ============================================

ALTER TABLE problema
ADD CONSTRAINT fk_problema_os
FOREIGN KEY (id_os)
REFERENCES ordem_servico(id_os);


-- ============================================
-- PROBLEMA -> EXECUCAO
-- ============================================

ALTER TABLE problema
ADD CONSTRAINT fk_problema_execucao
FOREIGN KEY (id_execucao)
REFERENCES execucao(id_execucao);


-- ============================================
-- EXECUCAO -> FUNCIONARIO
-- ============================================

ALTER TABLE execucao
ADD CONSTRAINT fk_execucao_funcionario
FOREIGN KEY (id_funcionario)
REFERENCES funcionario(id_funcionario);


-- ============================================
-- FUNCIONARIO -> LOGIN
-- ============================================

ALTER TABLE funcionario
ADD CONSTRAINT fk_funcionario_login
FOREIGN KEY (id_login)
REFERENCES login(id_login);


-- ============================================
-- LOGIN -> FUNCIONARIO
-- ============================================

ALTER TABLE login
ADD CONSTRAINT fk_login_funcionario
FOREIGN KEY (id_funcionario)
REFERENCES funcionario(id_funcionario);