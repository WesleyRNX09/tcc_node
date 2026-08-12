const db = require('../dataBase/connection');

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
                nome_peca,
                descricao_peca,
                preco_unitario,
                estoque
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Peça cadastrada com sucesso.',
                dados: {
                    id_peca: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar peça.',
                dados: error.message
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
                nome_peca,
                descricao_peca,
                preco_unitario,
                estoque,
                id
            ];

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
                mensagem: `Peça ${id} atualizada com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar peça.',
                dados: error.message
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