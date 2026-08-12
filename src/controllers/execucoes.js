const db = require('../dataBase/connection');

module.exports = {

    async listarExecucoes(request, response) {

        try {

            const sql = `
                SELECT
                    id_execucao,
                    id_funcionario,
                    data_inicio,
                    data_fim,
                    status
                FROM execucao;
            `;

            const [execucoes] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de execuções.',
                dados: execucoes
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarExecucao(request, response) {

        try {

            const {
                id_funcionario,
                data_inicio,
                data_fim,
                status
            } = request.body;

            const sql = `
                INSERT INTO execucao
                (
                    id_funcionario,
                    data_inicio,
                    data_fim,
                    status
                )
                VALUES (?, ?, ?, ?);
            `;

            const valores = [
                id_funcionario,
                data_inicio,
                data_fim || null,
                status
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Execução cadastrada com sucesso.',
                dados: {
                    id_execucao: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar execução.',
                dados: error.message
            });

        }

    },

    async editarExecucao(request, response) {

        try {

            const { id } = request.params;

            const {
                id_funcionario,
                data_inicio,
                data_fim,
                status
            } = request.body;

            const sql = `
                UPDATE execucao
                SET
                    id_funcionario = ?,
                    data_inicio = ?,
                    data_fim = ?,
                    status = ?
                WHERE id_execucao = ?;
            `;

            const valores = [
                id_funcionario,
                data_inicio,
                data_fim || null,
                status,
                id
            ];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Execução ${id} não encontrada.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Execução ${id} atualizada com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar execução.',
                dados: error.message
            });

        }

    },

    async apagarExecucao(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM execucao
                WHERE id_execucao = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Execução ${id} não encontrada.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Execução ${id} excluída com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir execução.',
                dados: error.message
            });

        }

    }

};