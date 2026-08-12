const db = require('../dataBase/connection');

module.exports = {

    async listarOrdensServico(request, response) {

        try {

            const sql = `
                SELECT
                    id_os,
                    id_cliente,
                    id_veiculo,
                    data_entrada,
                    data_previsao,
                    data_entrega,
                    status,
                    observacoes,
                    valor_total
                FROM ordem_servico;
            `;

            const [ordens] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de ordens de serviço.',
                dados: ordens
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarOrdemServico(request, response) {

        try {

            const {
                id_cliente,
                id_veiculo,
                data_entrada,
                data_previsao,
                data_entrega,
                status,
                observacoes,
                valor_total
            } = request.body;

            const sql = `
                INSERT INTO ordem_servico
                (
                    id_cliente,
                    id_veiculo,
                    data_entrada,
                    data_previsao,
                    data_entrega,
                    status,
                    observacoes,
                    valor_total
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const valores = [
                id_cliente,
                id_veiculo,
                data_entrada,
                data_previsao || null,
                data_entrega || null,
                status,
                observacoes,
                valor_total
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Ordem de serviço cadastrada com sucesso.',
                dados: {
                    id_os: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar ordem de serviço.',
                dados: error.message
            });

        }

    },

    async editarOrdemServico(request, response) {

        try {

            const { id } = request.params;

            const {
                id_cliente,
                id_veiculo,
                data_entrada,
                data_previsao,
                data_entrega,
                status,
                observacoes,
                valor_total
            } = request.body;

            const sql = `
                UPDATE ordem_servico
                SET
                    id_cliente = ?,
                    id_veiculo = ?,
                    data_entrada = ?,
                    data_previsao = ?,
                    data_entrega = ?,
                    status = ?,
                    observacoes = ?,
                    valor_total = ?
                WHERE id_os = ?;
            `;

            const valores = [
                id_cliente,
                id_veiculo,
                data_entrada,
                data_previsao || null,
                data_entrega || null,
                status,
                observacoes,
                valor_total,
                id
            ];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Ordem de serviço ${id} não encontrada.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Ordem de serviço ${id} atualizada com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar ordem de serviço.',
                dados: error.message
            });

        }

    },

    async apagarOrdemServico(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM ordem_servico
                WHERE id_os = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Ordem de serviço ${id} não encontrada.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Ordem de serviço ${id} excluída com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir ordem de serviço.',
                dados: error.message
            });

        }

    }

};