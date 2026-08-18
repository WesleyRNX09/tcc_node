const db = require('../dataBase/connection');

function idValido(valor) {

    const numero = Number(valor);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );

}

module.exports = {

    async listarPecas(request, response) {

        try {

            const sql = `
                SELECT
                    id_peca,
                    nome_peca,
                    descricao_peca,
                    preco_unitario,
                    estoque
                FROM peca;
            `;

            const [pecas] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de peças.',
                dados: pecas
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarPeca(request, response) {

        try {

            const {
                nome_peca,
                descricao_peca,
                preco_unitario,
                estoque
            } = request.body;


            // =====================================================
            // VALIDAR NOME
            // =====================================================

            if (
                typeof nome_peca !== 'string' ||
                !nome_peca.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nome da peça é obrigatório.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR PREÇO
            // =====================================================

            if (
                preco_unitario === undefined ||
                preco_unitario === null ||
                preco_unitario === ''
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Preço unitário é obrigatório.',
                    dados: null
                });

            }


            const precoNumero =
                Number(preco_unitario);


            if (
                Number.isNaN(precoNumero) ||
                precoNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Preço unitário deve ser um número maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR ESTOQUE
            // =====================================================

            if (
                estoque === undefined ||
                estoque === null ||
                estoque === ''
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Estoque é obrigatório.',
                    dados: null
                });

            }


            const estoqueNumero =
                Number(estoque);


            if (
                !Number.isInteger(estoqueNumero) ||
                estoqueNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Estoque deve ser um número inteiro maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // CADASTRAR
            // =====================================================

            const sql = `
                INSERT INTO peca
                (
                    nome_peca,
                    descricao_peca,
                    preco_unitario,
                    estoque
                )
                VALUES (?, ?, ?, ?);
            `;


            const valores = [
                nome_peca.trim(),
                descricao_peca
                    ? descricao_peca.trim()
                    : null,
                precoNumero,
                estoqueNumero
            ];


            const [resultado] =
                await db.query(
                    sql,
                    valores
                );


            return response.status(201).json({
                sucesso: true,
                mensagem:
                    'Peça cadastrada com sucesso.',
                dados: {
                    id_peca:
                        resultado.insertId
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao cadastrar peça.',
                dados:
                    error.message
            });

        }

    },

    async editarPeca(request, response) {

        try {

            const { id } = request.params;


            const {
                nome_peca,
                descricao_peca,
                preco_unitario,
                estoque
            } = request.body;


            // =====================================================
            // VALIDAR ID
            // =====================================================

            if (!idValido(id)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'ID da peça inválido.',
                    dados: null
                });

            }


            // =====================================================
            // BUSCAR PEÇA ATUAL
            // =====================================================

            const sqlPeca = `
                SELECT
                    id_peca,
                    nome_peca,
                    descricao_peca,
                    preco_unitario,
                    estoque

                FROM peca

                WHERE id_peca = ?;
            `;


            const [pecas] =
                await db.query(
                    sqlPeca,
                    [id]
                );


            if (pecas.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        `Peça ${id} não encontrada.`,
                    dados: null
                });

            }


            const pecaAtual =
                pecas[0];


            // =====================================================
            // MONTAR NOVOS VALORES
            // =====================================================

            const novoNome =
                nome_peca !== undefined
                    ? nome_peca
                    : pecaAtual.nome_peca;


            const novaDescricao =
                descricao_peca !== undefined
                    ? descricao_peca
                    : pecaAtual.descricao_peca;


            const novoPreco =
                preco_unitario !== undefined
                    ? preco_unitario
                    : pecaAtual.preco_unitario;


            const novoEstoque =
                estoque !== undefined
                    ? estoque
                    : pecaAtual.estoque;


            // =====================================================
            // VALIDAR NOME
            // =====================================================

            if (
                typeof novoNome !== 'string' ||
                !novoNome.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Nome da peça é obrigatório.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR PREÇO
            // =====================================================

            if (
                novoPreco === null ||
                novoPreco === ''
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Preço unitário é obrigatório.',
                    dados: null
                });

            }


            const precoNumero =
                Number(novoPreco);


            if (
                Number.isNaN(precoNumero) ||
                precoNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Preço unitário deve ser um número maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR ESTOQUE
            // =====================================================

            if (
                novoEstoque === null ||
                novoEstoque === ''
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Estoque é obrigatório.',
                    dados: null
                });

            }


            const estoqueNumero =
                Number(novoEstoque);


            if (
                !Number.isInteger(estoqueNumero) ||
                estoqueNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Estoque deve ser um número inteiro maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // ATUALIZAR
            // =====================================================

            const sql = `
                UPDATE peca

                SET
                    nome_peca = ?,
                    descricao_peca = ?,
                    preco_unitario = ?,
                    estoque = ?

                WHERE id_peca = ?;
            `;


            const valores = [
                novoNome.trim(),

                novaDescricao
                    ? String(novaDescricao).trim()
                    : null,

                precoNumero,
                estoqueNumero,
                id
            ];


            await db.query(
                sql,
                valores
            );


            return response.status(200).json({
                sucesso: true,
                mensagem:
                    `Peça ${id} atualizada com sucesso.`,
                dados: {
                    id_peca:
                        Number(id)
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao atualizar peça.',
                dados:
                    error.message
            });

        }

    },

    async apagarPeca(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM peca
                WHERE id_peca = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Peça ${id} não encontrada.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Peça ${id} excluída com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir peça.',
                dados: error.message
            });

        }

    }

};