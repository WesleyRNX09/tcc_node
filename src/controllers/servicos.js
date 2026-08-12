const db = require('../dataBase/connection');

module.exports = {

    async listarServicos(request, response) {

        try {

            const sql = `
                SELECT
                    id_servico,
                    id_problema,
                    descricao_serv,
                    tempo_estimado,
                    valor_mao_obra
                FROM servico;
            `;

            const [servicos] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de serviços.',
                dados: servicos
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarServico(request, response) {

        try {

            const {
                id_problema,
                descricao_serv,
                tempo_estimado,
                valor_mao_obra
            } = request.body;

            const sql = `
                INSERT INTO servico
                (
                    id_problema,
                    descricao_serv,
                    tempo_estimado,
                    valor_mao_obra
                )
                VALUES (?, ?, ?, ?);
            `;

            const valores = [
                id_problema,
                descricao_serv,
                tempo_estimado,
                valor_mao_obra
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Serviço cadastrado com sucesso.',
                dados: {
                    id_servico: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar serviço.',
                dados: error.message
            });

        }

    },

    async editarServico(request, response) {

        try {

            const { id } = request.params;

            const {
                id_problema,
                descricao_serv,
                tempo_estimado,
                valor_mao_obra
            } = request.body;

            const sql = `
                UPDATE servico
                SET
                    id_problema = ?,
                    descricao_serv = ?,
                    tempo_estimado = ?,
                    valor_mao_obra = ?
                WHERE id_servico = ?;
            `;

            const valores = [
                id_problema,
                descricao_serv,
                tempo_estimado,
                valor_mao_obra,
                id
            ];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Serviço ${id} não encontrado.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Serviço ${id} atualizado com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar serviço.',
                dados: error.message
            });

        }

    },

    async apagarServico(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM servico
                WHERE id_servico = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Serviço ${id} não encontrado.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Serviço ${id} excluído com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir serviço.',
                dados: error.message
            });

        }

    }

};