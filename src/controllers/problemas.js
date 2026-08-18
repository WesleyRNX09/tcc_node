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