const db = require('../dataBase/connection');

// =========================================================
// VALIDAÇÕES DE PROBLEMA
// =========================================================

const PRIORIDADES_PERMITIDAS = [
    'Baixa',
    'Média',
    'Alta'
];

const STATUS_PROBLEMA_PERMITIDOS = [
    'Aberto',
    'Em análise',
    'Resolvido'
];


function idValido(valor) {

    const numero = Number(valor);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );

}

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

            const sqlOrdem = `
                SELECT id_os
                FROM ordem_servico
                WHERE id_os = ?;
            `;

            const [ordens] = await db.query(
                sqlOrdem,
                [id_os]
            );

            if (ordens.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Ordem de serviço não encontrada.',
                    dados: null
                });

            }

            // Campos obrigatórios
            if (
                !id_os ||
                !prioridade ||
                !status
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'OS, prioridade e status são obrigatórios.',
                    dados: null
                });

            }

            console.log(
                'TESTE DESCRICAO:',
                JSON.stringify(descricao_prob),
                'TAMANHO:',
                descricao_prob?.length,
                'APOS TRIM:',
                JSON.stringify(descricao_prob?.trim())
            );


            // Validar descrição
            if (
                typeof descricao_prob !== 'string' ||
                !descricao_prob.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Descrição do problema é obrigatória.',
                    dados: null
                });

            }

            // Validar prioridade
            if (
                typeof prioridade !== 'string' ||
                !PRIORIDADES_PERMITIDAS.includes(prioridade.trim())
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: `Prioridade inválida. Permitidas: ${PRIORIDADES_PERMITIDAS.join(', ')}.`,
                    dados: null
                });

            }

            // Validar status
            if (
                typeof status !== 'string' ||
                !STATUS_PROBLEMA_PERMITIDOS.includes(status.trim())
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: `Status inválido. Permitidos: ${STATUS_PROBLEMA_PERMITIDOS.join(', ')}.`,
                    dados: null
                });

            }

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
                descricao_prob.trim(),
                prioridade.trim(),
                status.trim(),
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


            // =====================================================
            // VALIDAR ID DO PROBLEMA
            // =====================================================

            if (!idValido(id)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'ID do problema inválido.',

                    dados: null

                });

            }


            // =====================================================
            // BUSCAR PROBLEMA ATUAL
            // =====================================================

            const sqlProblema = `
                SELECT
                    id_problema,
                    id_os,
                    descricao_prob,
                    prioridade,
                    status,
                    id_execucao

                FROM problema

                WHERE id_problema = ?;
            `;


            const [problemas] =
                await db.query(
                    sqlProblema,
                    [id]
                );


            if (problemas.length === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        `Problema ${id} não encontrado.`,

                    dados: null

                });

            }


            const problemaAtual =
                problemas[0];


            // =====================================================
            // MONTAR NOVOS VALORES
            // =====================================================

            const novoIdOs =
                id_os !== undefined
                    ? id_os
                    : problemaAtual.id_os;


            const novaDescricao =
                descricao_prob !== undefined
                    ? descricao_prob
                    : problemaAtual.descricao_prob;


            const novaPrioridade =
                prioridade !== undefined
                    ? prioridade
                    : problemaAtual.prioridade;


            const novoStatus =
                status !== undefined
                    ? status
                    : problemaAtual.status;


            const novoIdExecucao =
                id_execucao !== undefined
                    ? id_execucao
                    : problemaAtual.id_execucao;


            // =====================================================
            // VALIDAR OS
            // =====================================================

            if (!idValido(novoIdOs)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'ID da ordem de serviço inválido.',

                    dados: null

                });

            }


            const sqlOrdem = `
                SELECT id_os
                FROM ordem_servico
                WHERE id_os = ?;
            `;


            const [ordens] =
                await db.query(
                    sqlOrdem,
                    [novoIdOs]
                );


            if (ordens.length === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        'Ordem de serviço não encontrada.',

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
                        'Descrição do problema é obrigatória.',

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR PRIORIDADE
            // =====================================================

            if (
                typeof novaPrioridade !== 'string' ||
                !PRIORIDADES_PERMITIDAS.includes(
                    novaPrioridade.trim()
                )
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        `Prioridade inválida. Permitidas: ${PRIORIDADES_PERMITIDAS.join(', ')}.`,

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR STATUS
            // =====================================================

            if (
                typeof novoStatus !== 'string' ||
                !STATUS_PROBLEMA_PERMITIDOS.includes(
                    novoStatus.trim()
                )
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        `Status inválido. Permitidos: ${STATUS_PROBLEMA_PERMITIDOS.join(', ')}.`,

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR EXECUÇÃO
            // =====================================================

            if (
                novoIdExecucao !== null &&
                novoIdExecucao !== ''
            ) {

                if (!idValido(novoIdExecucao)) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'ID da execução inválido.',

                        dados: null

                    });

                }


                const sqlExecucao = `
                    SELECT id_execucao
                    FROM execucao
                    WHERE id_execucao = ?;
                `;


                const [execucoes] =
                    await db.query(
                        sqlExecucao,
                        [novoIdExecucao]
                    );


                if (execucoes.length === 0) {

                    return response.status(404).json({

                        sucesso: false,

                        mensagem:
                            'Execução não encontrada.',

                        dados: null

                    });

                }

            }


            // =====================================================
            // ATUALIZAR
            // =====================================================

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

                novoIdOs,
                novaDescricao.trim(),
                novaPrioridade.trim(),
                novoStatus.trim(),
                novoIdExecucao || null,
                id

            ];


            await db.query(
                sql,
                valores
            );


            return response.status(200).json({

                sucesso: true,

                mensagem:
                    `Problema ${id} atualizado com sucesso.`,

                dados: {
                    id_problema:
                        Number(id)
                }

            });


        } catch (error) {

            return response.status(500).json({

                sucesso: false,

                mensagem:
                    'Erro ao atualizar problema.',

                dados:
                    error.message

            });

        }

    },

    async apagarProblema(request, response) {

        const { id } = request.params;

        let conexao;


        try {

            conexao = await db.getConnection();

            await conexao.beginTransaction();


            // =============================================
            // VERIFICAR PROBLEMA
            // =============================================

            const sqlProblema = `
                SELECT
                    id_problema,
                    id_os
                FROM problema
                WHERE id_problema = ?
                FOR UPDATE;
            `;


            const [problemas] =
                await conexao.query(
                    sqlProblema,
                    [id]
                );


            if (problemas.length === 0) {

                await conexao.rollback();

                return response.status(404).json({
                    sucesso: false,
                    mensagem:
                        `Problema ${id} não encontrado.`,
                    dados: null
                });

            }


            // =============================================
            // PEGAR SERVIÇOS DO PROBLEMA
            // =============================================

            const sqlServicos = `
                SELECT id_servico
                FROM servico
                WHERE id_problema = ?;
            `;


            const [servicos] =
                await conexao.query(
                    sqlServicos,
                    [id]
                );


            // =============================================
            // EXCLUIR ITENS DA OS QUE USAM ESSES SERVIÇOS
            // =============================================

            for (const servico of servicos) {

                await conexao.query(
                    `
                        DELETE FROM item_os
                        WHERE id_servico = ?;
                    `,
                    [
                        servico.id_servico
                    ]
                );

            }


            // =============================================
            // EXCLUIR SERVIÇOS
            // =============================================

            await conexao.query(
                `
                    DELETE FROM servico
                    WHERE id_problema = ?;
                `,
                [id]
            );


            // =============================================
            // EXCLUIR PROBLEMA
            // =============================================

            await conexao.query(
                `
                    DELETE FROM problema
                    WHERE id_problema = ?;
                `,
                [id]
            );


            await conexao.commit();


            return response.status(200).json({
                sucesso: true,
                mensagem:
                    `Problema ${id} e seus serviços foram excluídos com sucesso.`,
                dados: null
            });


        } catch (error) {

            if (conexao) {

                await conexao.rollback();

            }


            return response.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro ao excluir problema.",
                dados:
                    error.message
            });


        } finally {

            if (conexao) {

                conexao.release();

            }

        }

    }

};