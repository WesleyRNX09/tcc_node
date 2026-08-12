const db = require('../dataBase/connection');

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
                forma_pagamento,
                valor,
                status,
                data_pagamento || null
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Pagamento cadastrado com sucesso.',
                dados: {
                    id_pagamento: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar pagamento.',
                dados: error.message
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
                id_os,
                forma_pagamento,
                valor,
                status,
                data_pagamento || null,
                id
            ];

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
                mensagem: `Pagamento ${id} atualizado com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar pagamento.',
                dados: error.message
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