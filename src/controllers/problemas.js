const db = require('../dataBase/connection');

module.exports = {

    async listarProblemas(request, response) {

        try {

            const sql = `
                SELECT
                    id_problema,
                    id_os,
                    descricao_prob,
                    prioridade,
                    status,
                    id_execucao
                FROM problema;
            `;

            const [problemas] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de problemas.',
                dados: problemas
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarProblema(request, response) {

        try {

            const {
                id_os,
                descricao_prob,
                prioridade,
                status,
                id_execucao
            } = request.body;

            const sql = `
                INSERT INTO problema
                (
                    id_os,
                    descricao_prob,
                    prioridade,
                    status,
                    id_execucao
                )
                VALUES (?, ?, ?, ?, ?);
            `;

            const valores = [
                id_os,
                descricao_prob,
                prioridade,
                status,
                id_execucao || null
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Problema cadastrado com sucesso.',
                dados: {
                    id_problema: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar problema.',
                dados: error.message
            });

        }

    },

    async editarProblema(request, response) {

        try {

            const { id } = request.params;

            const {
                id_os,
                descricao_prob,
                prioridade,
                status,
                id_execucao
            } = request.body;

            const sql = `
                UPDATE problema
                SET
                    id_os = ?,
                    descricao_prob = ?,
                    prioridade = ?,
                    status = ?,
                    id_execucao = ?
                WHERE id_problema = ?;
            `;

            const valores = [
                id_os,
                descricao_prob,
                prioridade,
                status,
                id_execucao || null,
                id
            ];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Problema ${id} não encontrado.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Problema ${id} atualizado com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar problema.',
                dados: error.message
            });

        }

    },

    async apagarProblema(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM problema
                WHERE id_problema = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Problema ${id} não encontrado.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Problema ${id} excluído com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir problema.',
                dados: error.message
            });

        }

    }

};