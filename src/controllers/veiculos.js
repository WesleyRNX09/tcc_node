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

            // Campos obrigatórios
            if (!id_cliente || !placa || !marca || !modelo) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Cliente, placa, marca e modelo são obrigatórios.',
                    dados: null
                });

            }

            // Validar ID do cliente
            if (
                !Number.isInteger(Number(id_cliente)) ||
                Number(id_cliente) <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do cliente inválido.',
                    dados: null
                });

            }

            // Verificar se cliente existe
            const sqlCliente = `
                SELECT id_cliente
                FROM cliente
                WHERE id_cliente = ?;
            `;

            const [cliente] = await db.query(
                sqlCliente,
                [id_cliente]
            );

            if (cliente.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Cliente não encontrado.',
                    dados: null
                });

            }

            // Padronizar placa
            const placaFormatada = placa
                .trim()
                .toUpperCase();

            // Verificar placa duplicada
            const sqlPlaca = `
                SELECT id_veiculo
                FROM veiculo
                WHERE placa = ?;
            `;

            const [veiculoPlaca] = await db.query(
                sqlPlaca,
                [placaFormatada]
            );

            if (veiculoPlaca.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Já existe um veículo cadastrado com essa placa.',
                    dados: null
                });

            }

            // Validar ano
            if (ano !== undefined && ano !== null && ano !== '') {

                const anoNumero = Number(ano);
                const anoAtual = new Date().getFullYear();

                if (
                    !Number.isInteger(anoNumero) ||
                    anoNumero < 1900 ||
                    anoNumero > anoAtual + 1
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'Ano do veículo inválido.',
                        dados: null
                    });

                }

            }

            // Validar quilometragem
            if (
                quilometragem !== undefined &&
                quilometragem !== null &&
                quilometragem !== ''
            ) {

                const km = Number(quilometragem);

                if (
                    Number.isNaN(km) ||
                    km < 0
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'A quilometragem não pode ser negativa.',
                        dados: null
                    });

                }

            }

            const sql = `
                INSERT INTO veiculo (
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
                placaFormatada,
                marca.trim(),
                modelo.trim(),
                ano || null,
                cor || null,
                quilometragem ?? 0
            ];

            const [resultado] = await db.query(
                sql,
                valores
            );

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
                mensagem: 'Erro na requisição.',
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

            // Validar ID do veículo
            if (
                !Number.isInteger(Number(id)) ||
                Number(id) <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do veículo inválido.',
                    dados: null
                });

            }

            // Verificar se veículo existe
            const sqlVeiculo = `
                SELECT
                    id_veiculo,
                    id_cliente,
                    placa,
                    marca,
                    modelo,
                    ano,
                    cor,
                    quilometragem
                FROM veiculo
                WHERE id_veiculo = ?;
            `;

            const [veiculos] = await db.query(
                sqlVeiculo,
                [id]
            );

            if (veiculos.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Veículo não encontrado.',
                    dados: null
                });

            }

            const veiculoAtual = veiculos[0];

            // Mantém o valor antigo quando não vier no PATCH
            const novoIdCliente =
                id_cliente ?? veiculoAtual.id_cliente;

            const novaPlaca =
                placa ?? veiculoAtual.placa;

            const novaMarca =
                marca ?? veiculoAtual.marca;

            const novoModelo =
                modelo ?? veiculoAtual.modelo;

            const novoAno =
                ano ?? veiculoAtual.ano;

            const novaCor =
                cor ?? veiculoAtual.cor;

            const novaQuilometragem =
                quilometragem ?? veiculoAtual.quilometragem;

            // Campos que não podem ficar vazios
            if (
                !novoIdCliente ||
                !novaPlaca ||
                !novaMarca ||
                !novoModelo
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Cliente, placa, marca e modelo são obrigatórios.',
                    dados: null
                });

            }

            // Validar cliente
            if (
                !Number.isInteger(Number(novoIdCliente)) ||
                Number(novoIdCliente) <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do cliente inválido.',
                    dados: null
                });

            }

            // Verificar se cliente existe
            const sqlCliente = `
                SELECT id_cliente
                FROM cliente
                WHERE id_cliente = ?;
            `;

            const [cliente] = await db.query(
                sqlCliente,
                [novoIdCliente]
            );

            if (cliente.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Cliente não encontrado.',
                    dados: null
                });

            }

            const placaFormatada =
                novaPlaca.trim().toUpperCase();

            // Verificar se a placa pertence a OUTRO veículo
            const sqlPlaca = `
                SELECT id_veiculo
                FROM veiculo
                WHERE placa = ?
                AND id_veiculo <> ?;
            `;

            const [placaExistente] = await db.query(
                sqlPlaca,
                [
                    placaFormatada,
                    id
                ]
            );

            if (placaExistente.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Essa placa já pertence a outro veículo.',
                    dados: null
                });

            }

            // Validar ano
            if (
                novoAno !== null &&
                novoAno !== ''
            ) {

                const anoNumero = Number(novoAno);
                const anoAtual = new Date().getFullYear();

                if (
                    !Number.isInteger(anoNumero) ||
                    anoNumero < 1900 ||
                    anoNumero > anoAtual + 1
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'Ano do veículo inválido.',
                        dados: null
                    });

                }

            }

            // Validar quilometragem
            if (
                novaQuilometragem !== null &&
                novaQuilometragem !== ''
            ) {

                const km = Number(novaQuilometragem);

                if (
                    Number.isNaN(km) ||
                    km < 0
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'A quilometragem não pode ser negativa.',
                        dados: null
                    });

                }

            }

            const sqlUpdate = `
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
                novoIdCliente,
                placaFormatada,
                novaMarca.trim(),
                novoModelo.trim(),
                novoAno || null,
                novaCor || null,
                novaQuilometragem ?? 0,
                id
            ];

            await db.query(
                sqlUpdate,
                valores
            );

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Veículo atualizado com sucesso.',
                dados: {
                    id_veiculo: Number(id)
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
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