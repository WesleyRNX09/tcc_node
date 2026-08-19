const db = require('../dataBase/connection');

// =========================================================
// VALIDAÇÕES DE EXECUÇÃO
// =========================================================

const STATUS_EXECUCAO_PERMITIDOS = [
    'Pendente',
    'Em andamento',
    'Finalizada',
    'Cancelada'
];


function idValido(valor) {

    const numero = Number(valor);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );

}


function dataValida(valor) {

    if (!valor) {
        return false;
    }

    const data = new Date(valor);

    return !Number.isNaN(
        data.getTime()
    );

}


function dataAnterior(data1, data2) {

    return (
        new Date(data1).getTime() <
        new Date(data2).getTime()
    );

}

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


            // =====================================================
            // VALIDAR FUNCIONÁRIO
            // =====================================================

            if (!idValido(id_funcionario)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do funcionário inválido.',
                    dados: null
                });

            }


            // =====================================================
            // VERIFICAR SE FUNCIONÁRIO EXISTE
            // =====================================================

            const sqlFuncionario = `
                SELECT id_funcionario
                FROM funcionario
                WHERE id_funcionario = ?;
            `;


            const [funcionarios] = await db.query(
                sqlFuncionario,
                [id_funcionario]
            );


            if (funcionarios.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Funcionário não encontrado.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DATA DE INÍCIO
            // =====================================================

            if (!data_inicio) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de início é obrigatória.',
                    dados: null
                });

            }


            if (!dataValida(data_inicio)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de início inválida.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DATA DE FIM
            // =====================================================

            if (
                data_fim !== undefined &&
                data_fim !== null &&
                data_fim !== ''
            ) {

                if (!dataValida(data_fim)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'Data de fim inválida.',
                        dados: null
                    });

                }


                if (
                    dataAnterior(
                        data_fim,
                        data_inicio
                    )
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'A data de fim não pode ser anterior à data de início.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // VALIDAR STATUS
            // =====================================================

            if (
                typeof status !== 'string' ||
                !status.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Status é obrigatório.',
                    dados: null
                });

            }


            const statusFormatado =
                status.trim();


            if (
                !STATUS_EXECUCAO_PERMITIDOS.includes(
                    statusFormatado
                )
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        `Status inválido. Permitidos: ${STATUS_EXECUCAO_PERMITIDOS.join(', ')}.`,
                    dados: null
                });

            }


            // =====================================================
            // CADASTRAR
            // =====================================================

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
                statusFormatado
            ];


            const [resultado] =
                await db.query(
                    sql,
                    valores
                );


            return response.status(201).json({
                sucesso: true,
                mensagem: 'Execução cadastrada com sucesso.',
                dados: {
                    id_execucao:
                        resultado.insertId
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


            // =====================================================
            // VALIDAR ID DA EXECUÇÃO
            // =====================================================

            if (!idValido(id)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID da execução inválido.',
                    dados: null
                });

            }


            // =====================================================
            // BUSCAR EXECUÇÃO ATUAL
            // =====================================================

            const sqlExecucao = `
                SELECT
                    id_execucao,
                    id_funcionario,
                    data_inicio,
                    data_fim,
                    status

                FROM execucao

                WHERE id_execucao = ?;
            `;


            const [execucoes] =
                await db.query(
                    sqlExecucao,
                    [id]
                );


            if (execucoes.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        `Execução ${id} não encontrada.`,
                    dados: null
                });

            }


            const execucaoAtual =
                execucoes[0];


            // =====================================================
            // MONTAR NOVOS VALORES
            // =====================================================

            const novoIdFuncionario =
                id_funcionario !== undefined
                    ? id_funcionario
                    : execucaoAtual.id_funcionario;


            const novaDataInicio =
                data_inicio !== undefined
                    ? data_inicio
                    : execucaoAtual.data_inicio;


            const novaDataFim =
                data_fim !== undefined
                    ? (
                        data_fim === ''
                            ? null
                            : data_fim
                    )
                    : execucaoAtual.data_fim;


            const novoStatus =
                status !== undefined
                    ? status
                    : execucaoAtual.status;


            // =====================================================
            // VALIDAR FUNCIONÁRIO
            // =====================================================

            if (!idValido(novoIdFuncionario)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do funcionário inválido.',
                    dados: null
                });

            }


            const sqlFuncionario = `
                SELECT id_funcionario
                FROM funcionario
                WHERE id_funcionario = ?;
            `;


            const [funcionarios] =
                await db.query(
                    sqlFuncionario,
                    [novoIdFuncionario]
                );


            if (funcionarios.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Funcionário não encontrado.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DATA DE INÍCIO
            // =====================================================

            if (!dataValida(novaDataInicio)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de início inválida.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR DATA DE FIM
            // =====================================================

            if (novaDataFim) {

                if (!dataValida(novaDataFim)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'Data de fim inválida.',
                        dados: null
                    });

                }


                if (
                    dataAnterior(
                        novaDataFim,
                        novaDataInicio
                    )
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'A data de fim não pode ser anterior à data de início.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // VALIDAR STATUS
            // =====================================================

            if (
                typeof novoStatus !== 'string' ||
                !novoStatus.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Status é obrigatório.',
                    dados: null
                });

            }


            const statusFormatado =
                novoStatus.trim();


            if (
                !STATUS_EXECUCAO_PERMITIDOS.includes(
                    statusFormatado
                )
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        `Status inválido. Permitidos: ${STATUS_EXECUCAO_PERMITIDOS.join(', ')}.`,
                    dados: null
                });

            }


            // =====================================================
            // ATUALIZAR
            // =====================================================

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
                novoIdFuncionario,
                novaDataInicio,
                novaDataFim,
                statusFormatado,
                id
            ];


            await db.query(
                sql,
                valores
            );


            return response.status(200).json({
                sucesso: true,
                mensagem:
                    `Execução ${id} atualizada com sucesso.`,
                dados: {
                    id_execucao:
                        Number(id)
                }
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