const db = require('../dataBase/connection');

module.exports = {

    async listarVeiculos(request, response) {

        try {

            const sql = `
                SELECT
                    id_veiculo,
                    id_cliente,
                    placa,
                    marca,
                    modelo,
                    ano,
                    cor,
                    quilometragem
                FROM veiculo;
            `;

            const [veiculos] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de veículos.',
                dados: veiculos
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarVeiculo(request, response) {

        try {

            const {
                id_cliente,
                placa,
                marca,
                modelo,
                ano,
                cor,
                quilometragem
            } = request.body;

            const sql = `
                INSERT INTO veiculo
                (
                    id_cliente,
                    placa,
                    marca,
                    modelo,
                    ano,
                    cor,
                    quilometragem
                )
                VALUES (?, ?, ?, ?, ?, ?, ?);
            `;

            const valores = [
                id_cliente,
                placa,
                marca,
                modelo,
                ano,
                cor,
                quilometragem
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Veículo cadastrado com sucesso.',
                dados: {
                    id_veiculo: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar veículo.',
                dados: error.message
            });

        }

    },

    async editarVeiculo(request, response) {

    try {

        const { id } = request.params;

        const {
            id_cliente,
            placa,
            marca,
            modelo,
            ano,
            cor,
            quilometragem
        } = request.body;

        const sql = `
            UPDATE veiculo
            SET
                id_cliente = ?,
                placa = ?,
                marca = ?,
                modelo = ?,
                ano = ?,
                cor = ?,
                quilometragem = ?
            WHERE id_veiculo = ?;
        `;

        const valores = [
            id_cliente,
            placa,
            marca,
            modelo,
            ano,
            cor,
            quilometragem,
            id
        ];

        const [resultado] = await db.query(sql, valores);

        if (resultado.affectedRows === 0) {
            return response.status(404).json({
                sucesso: false,
                mensagem: `Veículo ${id} não encontrado.`,
                dados: null
            });
        }

        return response.status(200).json({
            sucesso: true,
            mensagem: `Veículo ${id} atualizado com sucesso.`,
            dados: null
        });

    } catch (error) {

        return response.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar veículo.',
            dados: error.message
        });

    }

    },

    async apagarVeiculo(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM veiculo
                WHERE id_veiculo = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Veículo ${id} não encontrado.`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Veículo ${id} excluído com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir veículo.',
                dados: error.message
            });

        }

    }

};