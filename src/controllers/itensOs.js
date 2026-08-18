const db = require('../dataBase/connection');

function idValido(valor) {

    const numero = Number(valor);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );

}

module.exports = {

    async listarItensOs(request, response) {

        try {

            const sql = `
                SELECT
                    id_item,
                    id_os,
                    id_servico,
                    id_peca,
                    quantidade,
                    valor_unitario,
                    valor_total
                FROM item_os;
            `;

            const [itens] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de itens da ordem de serviço.',
                dados: itens
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarItemOs(request, response) {

        try {

            const {
                id_os,
                id_servico,
                id_peca,
                quantidade,
                valor_unitario
            } = request.body;


            // =====================================================
            // VALIDAR OS
            // =====================================================

            if (!idValido(id_os)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID da ordem de serviço inválido.',
                    dados: null
                });

            }


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
            // VALIDAR SERVIÇO / PEÇA
            // =====================================================

            const possuiServico =
                id_servico !== undefined &&
                id_servico !== null &&
                id_servico !== '';


            const possuiPeca =
                id_peca !== undefined &&
                id_peca !== null &&
                id_peca !== '';


            // Precisa informar pelo menos um
            if (!possuiServico && !possuiPeca) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Informe um serviço ou uma peça.',
                    dados: null
                });

            }


            // Não permite os dois ao mesmo tempo
            if (possuiServico && possuiPeca) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'O item deve possuir apenas um serviço ou uma peça, não os dois.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR SERVIÇO
            // =====================================================

            if (possuiServico) {

                if (!idValido(id_servico)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'ID do serviço inválido.',
                        dados: null
                    });

                }


                const sqlServico = `
                    SELECT
                        s.id_servico,
                        p.id_os

                    FROM servico s

                    INNER JOIN problema p
                        ON p.id_problema = s.id_problema

                    WHERE s.id_servico = ?;
                `;


                const [servicos] = await db.query(
                    sqlServico,
                    [id_servico]
                );


                if (servicos.length === 0) {

                    return response.status(404).json({
                        sucesso: false,
                        mensagem:
                            'Serviço não encontrado.',
                        dados: null
                    });

                }


                // Serviço deve pertencer à mesma OS
                if (
                    Number(servicos[0].id_os) !==
                    Number(id_os)
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'O serviço informado não pertence a esta ordem de serviço.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // VALIDAR PEÇA
            // =====================================================

            if (possuiPeca) {

                if (!idValido(id_peca)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'ID da peça inválido.',
                        dados: null
                    });

                }


                const sqlPeca = `
                    SELECT id_peca
                    FROM peca
                    WHERE id_peca = ?;
                `;


                const [pecas] = await db.query(
                    sqlPeca,
                    [id_peca]
                );


                if (pecas.length === 0) {

                    return response.status(404).json({
                        sucesso: false,
                        mensagem:
                            'Peça não encontrada.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // VALIDAR QUANTIDADE
            // =====================================================

            const quantidadeNumero =
                Number(quantidade);


            if (
                !Number.isInteger(quantidadeNumero) ||
                quantidadeNumero <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Quantidade deve ser um número inteiro maior que zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR VALOR UNITÁRIO
            // =====================================================

            if (
                valor_unitario === undefined ||
                valor_unitario === null ||
                valor_unitario === ''
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Valor unitário é obrigatório.',
                    dados: null
                });

            }


            const valorUnitarioNumero =
                Number(valor_unitario);


            if (
                Number.isNaN(valorUnitarioNumero) ||
                valorUnitarioNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Valor unitário deve ser maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // CALCULAR VALOR TOTAL
            // =====================================================

            const valorTotal =
                quantidadeNumero *
                valorUnitarioNumero;


            // =====================================================
            // CADASTRAR
            // =====================================================

            const sql = `
                INSERT INTO item_os
                (
                    id_os,
                    id_servico,
                    id_peca,
                    quantidade,
                    valor_unitario,
                    valor_total
                )
                VALUES (?, ?, ?, ?, ?, ?);
            `;


            const valores = [
                id_os,
                possuiServico
                    ? id_servico
                    : null,
                possuiPeca
                    ? id_peca
                    : null,
                quantidadeNumero,
                valorUnitarioNumero,
                valorTotal
            ];


            const [resultado] =
                await db.query(
                    sql,
                    valores
                );


            return response.status(201).json({
                sucesso: true,
                mensagem:
                    'Item cadastrado com sucesso.',
                dados: {
                    id_item:
                        resultado.insertId,
                    valor_total:
                        valorTotal
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao cadastrar item.',
                dados:
                    error.message
            });

        }

    },

    async editarItemOs(request, response) {

        try {

            const { id } = request.params;


            const {
                id_os,
                id_servico,
                id_peca,
                quantidade,
                valor_unitario
            } = request.body;


            // =====================================================
            // VALIDAR ID DO ITEM
            // =====================================================

            if (!idValido(id)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'ID do item inválido.',
                    dados: null
                });

            }


            // =====================================================
            // BUSCAR ITEM ATUAL
            // =====================================================

            const sqlItem = `
                SELECT
                    id_item,
                    id_os,
                    id_servico,
                    id_peca,
                    quantidade,
                    valor_unitario,
                    valor_total

                FROM item_os

                WHERE id_item = ?;
            `;


            const [itens] =
                await db.query(
                    sqlItem,
                    [id]
                );


            if (itens.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        `Item ${id} não encontrado.`,
                    dados: null
                });

            }


            const itemAtual =
                itens[0];


            // =====================================================
            // MONTAR NOVOS VALORES
            // =====================================================

            const novoIdOs =
                id_os !== undefined
                    ? id_os
                    : itemAtual.id_os;


            const novoIdServico =
                id_servico !== undefined
                    ? id_servico
                    : itemAtual.id_servico;


            const novoIdPeca =
                id_peca !== undefined
                    ? id_peca
                    : itemAtual.id_peca;


            const novaQuantidade =
                quantidade !== undefined
                    ? quantidade
                    : itemAtual.quantidade;


            const novoValorUnitario =
                valor_unitario !== undefined
                    ? valor_unitario
                    : itemAtual.valor_unitario;


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
            // SERVIÇO OU PEÇA
            // =====================================================

            const possuiServico =
                novoIdServico !== null &&
                novoIdServico !== '';


            const possuiPeca =
                novoIdPeca !== null &&
                novoIdPeca !== '';


            if (!possuiServico && !possuiPeca) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Informe um serviço ou uma peça.',
                    dados: null
                });

            }


            if (possuiServico && possuiPeca) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'O item deve possuir apenas um serviço ou uma peça, não os dois.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR SERVIÇO
            // =====================================================

            if (possuiServico) {

                if (!idValido(novoIdServico)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'ID do serviço inválido.',
                        dados: null
                    });

                }


                const sqlServico = `
                    SELECT
                        s.id_servico,
                        p.id_os

                    FROM servico s

                    INNER JOIN problema p
                        ON p.id_problema = s.id_problema

                    WHERE s.id_servico = ?;
                `;


                const [servicos] =
                    await db.query(
                        sqlServico,
                        [novoIdServico]
                    );


                if (servicos.length === 0) {

                    return response.status(404).json({
                        sucesso: false,
                        mensagem:
                            'Serviço não encontrado.',
                        dados: null
                    });

                }


                if (
                    Number(servicos[0].id_os) !==
                    Number(novoIdOs)
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'O serviço informado não pertence a esta ordem de serviço.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // VALIDAR PEÇA
            // =====================================================

            if (possuiPeca) {

                if (!idValido(novoIdPeca)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'ID da peça inválido.',
                        dados: null
                    });

                }


                const sqlPeca = `
                    SELECT id_peca
                    FROM peca
                    WHERE id_peca = ?;
                `;


                const [pecas] =
                    await db.query(
                        sqlPeca,
                        [novoIdPeca]
                    );


                if (pecas.length === 0) {

                    return response.status(404).json({
                        sucesso: false,
                        mensagem:
                            'Peça não encontrada.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // VALIDAR QUANTIDADE
            // =====================================================

            const quantidadeNumero =
                Number(novaQuantidade);


            if (
                !Number.isInteger(quantidadeNumero) ||
                quantidadeNumero <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Quantidade deve ser um número inteiro maior que zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR VALOR UNITÁRIO
            // =====================================================

            const valorUnitarioNumero =
                Number(novoValorUnitario);


            if (
                novoValorUnitario === null ||
                novoValorUnitario === '' ||
                Number.isNaN(valorUnitarioNumero) ||
                valorUnitarioNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Valor unitário deve ser maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // RECALCULAR TOTAL
            // =====================================================

            const valorTotal =
                quantidadeNumero *
                valorUnitarioNumero;


            // =====================================================
            // ATUALIZAR
            // =====================================================

            const sql = `
                UPDATE item_os

                SET
                    id_os = ?,
                    id_servico = ?,
                    id_peca = ?,
                    quantidade = ?,
                    valor_unitario = ?,
                    valor_total = ?

                WHERE id_item = ?;
            `;


            const valores = [
                novoIdOs,
                possuiServico
                    ? novoIdServico
                    : null,
                possuiPeca
                    ? novoIdPeca
                    : null,
                quantidadeNumero,
                valorUnitarioNumero,
                valorTotal,
                id
            ];


            await db.query(
                sql,
                valores
            );


            return response.status(200).json({
                sucesso: true,
                mensagem:
                    `Item ${id} atualizado com sucesso.`,
                dados: {
                    id_item:
                        Number(id),
                    valor_total:
                        valorTotal
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao atualizar item.',
                dados:
                    error.message
            });

        }

    },

    async apagarItemOs(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM item_os
                WHERE id_item = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Item ${id} não encontrado.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Item ${id} excluído com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir item.',
                dados: error.message
            });

        }

    }

};