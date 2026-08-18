const db = require('../dataBase/connection');

function idValido(valor) {

    const numero = Number(valor);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );

}

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


            // =====================================================
            // CAMPOS OBRIGATÓRIOS
            // =====================================================

            if (
                id_problema === undefined ||
                descricao_serv === undefined ||
                tempo_estimado === undefined ||
                valor_mao_obra === undefined
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Problema, descrição, tempo estimado e valor da mão de obra são obrigatórios.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR ID DO PROBLEMA
            // =====================================================

            if (!idValido(id_problema)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do problema inválido.',
                    dados: null
                });

            }


            // =====================================================
            // VERIFICAR SE PROBLEMA EXISTE
            // =====================================================

            const sqlProblema = `
                SELECT id_problema
                FROM problema
                WHERE id_problema = ?;
            `;

            const [problemas] = await db.query(
                sqlProblema,
                [id_problema]
            );


            if (problemas.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Problema não encontrado.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DESCRIÇÃO
            // =====================================================

            if (
                typeof descricao_serv !== 'string' ||
                !descricao_serv.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Descrição do serviço é obrigatória.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR TEMPO ESTIMADO
            // =====================================================

            const tempoNumero =
                Number(tempo_estimado);


            if (
                !Number.isInteger(tempoNumero) ||
                tempoNumero <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Tempo estimado deve ser um número inteiro maior que zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR VALOR DA MÃO DE OBRA
            // =====================================================

            const valorNumero =
                Number(valor_mao_obra);


            if (
                valor_mao_obra === '' ||
                Number.isNaN(valorNumero) ||
                valorNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Valor da mão de obra deve ser maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // CADASTRAR
            // =====================================================

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
                descricao_serv.trim(),
                tempoNumero,
                valorNumero
            ];


            const [resultado] =
                await db.query(
                    sql,
                    valores
                );


            return response.status(201).json({
                sucesso: true,
                mensagem:
                    'Serviço cadastrado com sucesso.',
                dados: {
                    id_servico:
                        resultado.insertId
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao cadastrar serviço.',
                dados:
                    error.message
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


            // =====================================================
            // VALIDAR ID DO SERVIÇO
            // =====================================================

            if (!idValido(id)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'ID do serviço inválido.',
                    dados: null
                });

            }


            // =====================================================
            // BUSCAR SERVIÇO ATUAL
            // =====================================================

            const sqlServico = `
                SELECT
                    id_servico,
                    id_problema,
                    descricao_serv,
                    tempo_estimado,
                    valor_mao_obra
                FROM servico
                WHERE id_servico = ?;
            `;


            const [servicos] =
                await db.query(
                    sqlServico,
                    [id]
                );


            if (servicos.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        `Serviço ${id} não encontrado.`,
                    dados: null
                });

            }


            const servicoAtual =
                servicos[0];


            // =====================================================
            // MONTAR NOVOS VALORES
            // =====================================================

            const novoIdProblema =
                id_problema !== undefined
                    ? id_problema
                    : servicoAtual.id_problema;


            const novaDescricao =
                descricao_serv !== undefined
                    ? descricao_serv
                    : servicoAtual.descricao_serv;


            const novoTempo =
                tempo_estimado !== undefined
                    ? tempo_estimado
                    : servicoAtual.tempo_estimado;


            const novoValor =
                valor_mao_obra !== undefined
                    ? valor_mao_obra
                    : servicoAtual.valor_mao_obra;


            // =====================================================
            // VALIDAR PROBLEMA
            // =====================================================

            if (!idValido(novoIdProblema)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'ID do problema inválido.',
                    dados: null
                });

            }


            const sqlProblema = `
                SELECT id_problema
                FROM problema
                WHERE id_problema = ?;
            `;


            const [problemas] =
                await db.query(
                    sqlProblema,
                    [novoIdProblema]
                );


            if (problemas.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        'Problema não encontrado.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DESCRIÇÃO
            // =====================================================

            if (
                typeof novaDescricao !== 'string' ||
                !novaDescricao.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Descrição do serviço é obrigatória.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR TEMPO
            // =====================================================

            const tempoNumero =
                Number(novoTempo);


            if (
                !Number.isInteger(tempoNumero) ||
                tempoNumero <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Tempo estimado deve ser um número inteiro maior que zero.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR VALOR
            // =====================================================

            const valorNumero =
                Number(novoValor);


            if (
                novoValor === '' ||
                novoValor === null ||
                Number.isNaN(valorNumero) ||
                valorNumero < 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Valor da mão de obra deve ser maior ou igual a zero.',
                    dados: null
                });

            }


            // =====================================================
            // ATUALIZAR
            // =====================================================

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
                novoIdProblema,
                novaDescricao.trim(),
                tempoNumero,
                valorNumero,
                id
            ];


            await db.query(
                sql,
                valores
            );


            return response.status(200).json({
                sucesso: true,
                mensagem:
                    `Serviço ${id} atualizado com sucesso.`,
                dados: {
                    id_servico:
                        Number(id)
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao atualizar serviço.',
                dados:
                    error.message
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