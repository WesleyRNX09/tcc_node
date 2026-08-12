const db = require('../dataBase/connection');

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
                valor_unitario,
                valor_total
            } = request.body;

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
                id_servico || null,
                id_peca || null,
                quantidade,
                valor_unitario,
                valor_total
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Item cadastrado com sucesso.',
                dados: {
                    id_item: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar item.',
                dados: error.message
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
                valor_unitario,
                valor_total
            } = request.body;

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
                id_os,
                id_servico || null,
                id_peca || null,
                quantidade,
                valor_unitario,
                valor_total,
                id
            ];

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
                mensagem: `Item ${id} atualizado com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar item.',
                dados: error.message
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