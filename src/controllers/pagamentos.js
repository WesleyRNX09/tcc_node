const db = require('../dataBase/connection');

// =========================================================
// VALIDAÇÕES DE PAGAMENTO
// =========================================================

const FORMAS_PAGAMENTO_PERMITIDAS = [
    'cartao',
    'pix',
    'dinheiro'
];

const STATUS_PAGAMENTO_PERMITIDOS = [
    'pendente',
    'pago',
    'cancelado'
];


function idValido(valor) {

    const numero = Number(valor);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );

}


function dataValida(valor) {

    if (!valor) {
        return false;
    }

    const data = new Date(valor);

    return !Number.isNaN(
        data.getTime()
    );

}

module.exports = {

    async listarPagamentos(request, response) {

        try {

            const sql = `
                SELECT
                    id_pagamento,
                    id_os,
                    forma_pagamento,
                    valor,
                    status,
                    data_pagamento
                FROM pagamento;
            `;

            const [pagamentos] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de pagamentos.',
                dados: pagamentos
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarPagamento(request, response) {

        try {

            const {
                id_os,
                forma_pagamento,
                valor,
                status,
                data_pagamento
            } = request.body;


            // =====================================================
            // VALIDAR ID DA OS
            // =====================================================

            if (!idValido(id_os)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID da ordem de serviço inválido.',
                    dados: null
                });

            }


            // =====================================================
            // VERIFICAR SE A OS EXISTE
            // =====================================================

            const sqlOrdem = `
                SELECT id_os
                FROM ordem_servico
                WHERE id_os = ?;
            `;


            const [ordens] = await db.query(
                sqlOrdem,
                [id_os]
            );


            if (ordens.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Ordem de serviço não encontrada.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR FORMA DE PAGAMENTO
            // =====================================================

            if (
                typeof forma_pagamento !== 'string' ||
                !forma_pagamento.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Forma de pagamento é obrigatória.',
                    dados: null
                });

            }


            const formaPagamento =
                forma_pagamento
                    .trim()
                    .toLowerCase();


            if (
                !FORMAS_PAGAMENTO_PERMITIDAS.includes(
                    formaPagamento
                )
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        `Forma de pagamento inválida. Permitidas: ${FORMAS_PAGAMENTO_PERMITIDAS.join(', ')}.`,
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR VALOR
            // =====================================================

            if (
                valor === undefined ||
                valor === null ||
                valor === ''
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Valor do pagamento é obrigatório.',
                    dados: null
                });

            }


            const valorNumero =
                Number(valor);


            if (
                Number.isNaN(valorNumero) ||
                valorNumero <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Valor do pagamento deve ser maior que zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR STATUS
            // =====================================================

            if (
                typeof status !== 'string' ||
                !status.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Status do pagamento é obrigatório.',
                    dados: null
                });

            }


            const statusPagamento =
                status
                    .trim()
                    .toLowerCase();


            if (
                !STATUS_PAGAMENTO_PERMITIDOS.includes(
                    statusPagamento
                )
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        `Status inválido. Permitidos: ${STATUS_PAGAMENTO_PERMITIDOS.join(', ')}.`,
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DATA DO PAGAMENTO
            // =====================================================

            if (
                data_pagamento !== undefined &&
                data_pagamento !== null &&
                data_pagamento !== ''
            ) {

                if (!dataValida(data_pagamento)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'Data do pagamento inválida.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // CADASTRAR
            // =====================================================

            const sql = `
                INSERT INTO pagamento
                (
                    id_os,
                    forma_pagamento,
                    valor,
                    status,
                    data_pagamento
                )
                VALUES (?, ?, ?, ?, ?);
            `;


            const valores = [
                id_os,
                formaPagamento,
                valorNumero,
                statusPagamento,
                data_pagamento || null
            ];


            const [resultado] =
                await db.query(
                    sql,
                    valores
                );


            return response.status(201).json({
                sucesso: true,
                mensagem:
                    'Pagamento cadastrado com sucesso.',
                dados: {
                    id_pagamento:
                        resultado.insertId
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao cadastrar pagamento.',
                dados:
                    error.message
            });

        }

    },

    async editarPagamento(request, response) {

        try {

            const { id } = request.params;


            const {
                id_os,
                forma_pagamento,
                valor,
                status,
                data_pagamento
            } = request.body;


            // =====================================================
            // VALIDAR ID DO PAGAMENTO
            // =====================================================

            if (!idValido(id)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'ID do pagamento inválido.',
                    dados: null
                });

            }


            // =====================================================
            // BUSCAR PAGAMENTO ATUAL
            // =====================================================

            const sqlPagamento = `
                SELECT
                    id_pagamento,
                    id_os,
                    forma_pagamento,
                    valor,
                    status,
                    data_pagamento

                FROM pagamento

                WHERE id_pagamento = ?;
            `;


            const [pagamentos] =
                await db.query(
                    sqlPagamento,
                    [id]
                );


            if (pagamentos.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        `Pagamento ${id} não encontrado.`,
                    dados: null
                });

            }


            const pagamentoAtual =
                pagamentos[0];


            // =====================================================
            // MONTAR NOVOS VALORES
            // =====================================================

            const novoIdOs =
                id_os !== undefined
                    ? id_os
                    : pagamentoAtual.id_os;


            const novaForma =
                forma_pagamento !== undefined
                    ? forma_pagamento
                    : pagamentoAtual.forma_pagamento;


            const novoValor =
                valor !== undefined
                    ? valor
                    : pagamentoAtual.valor;


            const novoStatus =
                status !== undefined
                    ? status
                    : pagamentoAtual.status;


            const novaData =
                data_pagamento !== undefined
                    ? (
                        data_pagamento === ''
                            ? null
                            : data_pagamento
                    )
                    : pagamentoAtual.data_pagamento;


            // =====================================================
            // VALIDAR OS
            // =====================================================

            if (!idValido(novoIdOs)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'ID da ordem de serviço inválido.',
                    dados: null
                });

            }


            const sqlOrdem = `
                SELECT id_os
                FROM ordem_servico
                WHERE id_os = ?;
            `;


            const [ordens] =
                await db.query(
                    sqlOrdem,
                    [novoIdOs]
                );


            if (ordens.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        'Ordem de serviço não encontrada.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR FORMA DE PAGAMENTO
            // =====================================================

            if (
                typeof novaForma !== 'string' ||
                !novaForma.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Forma de pagamento é obrigatória.',
                    dados: null
                });

            }


            const formaPagamento =
                novaForma
                    .trim()
                    .toLowerCase();


            if (
                !FORMAS_PAGAMENTO_PERMITIDAS.includes(
                    formaPagamento
                )
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        `Forma de pagamento inválida. Permitidas: ${FORMAS_PAGAMENTO_PERMITIDAS.join(', ')}.`,
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR VALOR
            // =====================================================

            const valorNumero =
                Number(novoValor);


            if (
                novoValor === null ||
                novoValor === '' ||
                Number.isNaN(valorNumero) ||
                valorNumero <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Valor do pagamento deve ser maior que zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR STATUS
            // =====================================================

            if (
                typeof novoStatus !== 'string' ||
                !novoStatus.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Status do pagamento é obrigatório.',
                    dados: null
                });

            }


            const statusPagamento =
                novoStatus
                    .trim()
                    .toLowerCase();


            if (
                !STATUS_PAGAMENTO_PERMITIDOS.includes(
                    statusPagamento
                )
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        `Status inválido. Permitidos: ${STATUS_PAGAMENTO_PERMITIDOS.join(', ')}.`,
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DATA
            // =====================================================

            if (novaData) {

                if (!dataValida(novaData)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'Data do pagamento inválida.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // ATUALIZAR
            // =====================================================

            const sql = `
                UPDATE pagamento

                SET
                    id_os = ?,
                    forma_pagamento = ?,
                    valor = ?,
                    status = ?,
                    data_pagamento = ?

                WHERE id_pagamento = ?;
            `;


            const valores = [
                novoIdOs,
                formaPagamento,
                valorNumero,
                statusPagamento,
                novaData,
                id
            ];


            await db.query(
                sql,
                valores
            );


            return response.status(200).json({
                sucesso: true,
                mensagem:
                    `Pagamento ${id} atualizado com sucesso.`,
                dados: {
                    id_pagamento:
                        Number(id)
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao atualizar pagamento.',
                dados:
                    error.message
            });

        }

    },

    async apagarPagamento(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM pagamento
                WHERE id_pagamento = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Pagamento ${id} não encontrado.`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Pagamento ${id} excluído com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir pagamento.',
                dados: error.message
            });

        }

    }

};