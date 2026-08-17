const db = require('../dataBase/connection');

module.exports = {

    // =========================================================
    // LISTAR ORDENS DE SERVIÇO
    // COM FILTROS + JOIN + PAGINAÇÃO
    // =========================================================

    async listarOrdensServico(request, response) {

        try {

            const {
                id,
                cliente,
                placa,
                status,
                data_inicio,
                data_fim,
                page = 1,
                limit = 10
            } = request.query;


            const pagina = Math.max(parseInt(page) || 1, 1);

            const limite = Math.min(
                Math.max(parseInt(limit) || 10, 1),
                100
            );

            const offset = (pagina - 1) * limite;


            // -----------------------------------------
            // FILTROS
            // -----------------------------------------

            const filtros = [];

            const valores = [];


            if (id) {

                filtros.push(`os.id_os = ?`);

                valores.push(id);

            }


            if (cliente) {

                filtros.push(`c.nome_cliente LIKE ?`);

                valores.push(`%${cliente}%`);

            }


            if (placa) {

                filtros.push(`v.placa LIKE ?`);

                valores.push(`%${placa}%`);

            }


            if (status) {

                filtros.push(`os.status = ?`);

                valores.push(status);

            }


            if (data_inicio) {

                filtros.push(`os.data_entrada >= ?`);

                valores.push(data_inicio);

            }


            if (data_fim) {

                filtros.push(`os.data_entrada <= ?`);

                valores.push(data_fim);

            }


            const where = filtros.length > 0
                ? `WHERE ${filtros.join(' AND ')}`
                : '';


            // =================================================
            // CONTA QUANTAS OS EXISTEM
            // =================================================

            const sqlTotal = `
                SELECT
                    COUNT(*) AS total

                FROM ordem_servico os

                INNER JOIN cliente c
                    ON c.id_cliente = os.id_cliente

                INNER JOIN veiculo v
                    ON v.id_veiculo = os.id_veiculo

                ${where};
            `;


            const [resultadoTotal] = await db.query(
                sqlTotal,
                valores
            );


            const total = resultadoTotal[0].total;


            // =================================================
            // LISTAGEM
            // =================================================

            const sql = `
                SELECT
                    os.id_os,

                    os.id_cliente,
                    c.nome_cliente,
                    c.telefone,
                    c.email,

                    os.id_veiculo,
                    v.placa,
                    v.marca,
                    v.modelo,
                    v.ano,
                    v.cor,

                    os.data_entrada,
                    os.data_previsao,
                    os.data_entrega,

                    os.status,
                    os.observacoes,
                    os.valor_total

                FROM ordem_servico os

                INNER JOIN cliente c
                    ON c.id_cliente = os.id_cliente

                INNER JOIN veiculo v
                    ON v.id_veiculo = os.id_veiculo

                ${where}

                ORDER BY os.id_os DESC

                LIMIT ? OFFSET ?;
            `;


            const valoresListagem = [
                ...valores,
                limite,
                offset
            ];


            const [ordens] = await db.query(
                sql,
                valoresListagem
            );


            // Igual ao exemplo da apostila,
            // envia o total também pelo Header.
            response.setHeader(
                'X-Total-Count',
                total
            );


            return response.status(200).json({

                sucesso: true,

                mensagem: 'Lista de ordens de serviço.',

                itens: ordens.length,

                total: total,

                pagina: pagina,

                limite: limite,

                totalPaginas: Math.ceil(total / limite),

                dados: ordens

            });


        } catch (error) {

            return response.status(500).json({

                sucesso: false,

                mensagem: 'Erro ao listar ordens de serviço.',

                dados: error.message

            });

        }

    },


    // =========================================================
    // DETALHES COMPLETOS DE UMA ORDEM
    // =========================================================

    async detalharOrdemServico(request, response) {

        try {

            const { id } = request.params;


            // =================================================
            // 1 - OS + CLIENTE + VEÍCULO
            // =================================================

            const sqlOrdem = `
                SELECT
                    os.id_os,
                    os.data_entrada,
                    os.data_previsao,
                    os.data_entrega,
                    os.status,
                    os.observacoes,
                    os.valor_total,

                    c.id_cliente,
                    c.nome_cliente,
                    c.cpf,
                    c.telefone,
                    c.email,
                    c.endereco,

                    v.id_veiculo,
                    v.placa,
                    v.marca,
                    v.modelo,
                    v.ano,
                    v.cor,
                    v.quilometragem

                FROM ordem_servico os

                INNER JOIN cliente c
                    ON c.id_cliente = os.id_cliente

                INNER JOIN veiculo v
                    ON v.id_veiculo = os.id_veiculo

                WHERE os.id_os = ?;
            `;


            const [ordens] = await db.query(
                sqlOrdem,
                [id]
            );


            if (ordens.length === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        `Ordem de serviço ${id} não encontrada.`,

                    dados: null

                });

            }


            const ordem = ordens[0];


            // =================================================
            // 2 - PROBLEMAS + SERVIÇOS
            //     + EXECUÇÃO + FUNCIONÁRIO
            // =================================================

            const sqlProblemas = `
                SELECT
                    p.id_problema,
                    p.descricao_prob,
                    p.prioridade,
                    p.status AS status_problema,

                    s.id_servico,
                    s.descricao_serv,
                    s.tempo_estimado,
                    s.valor_mao_obra,

                    e.id_execucao,
                    e.data_inicio,
                    e.data_fim,
                    e.status AS status_execucao,

                    f.id_funcionario,
                    f.nome_funcionario,
                    f.especialidade,
                    f.telefone AS telefone_funcionario

                FROM problema p

                LEFT JOIN servico s
                    ON s.id_problema = p.id_problema

                LEFT JOIN execucao e
                    ON e.id_execucao = p.id_execucao

                LEFT JOIN funcionario f
                    ON f.id_funcionario = e.id_funcionario

                WHERE p.id_os = ?;
            `;


            const [rowsProblemas] = await db.query(
                sqlProblemas,
                [id]
            );


            const problemas = [];


            rowsProblemas.forEach((linha) => {

                let problema = problemas.find(
                    (item) =>
                        item.id_problema ===
                        linha.id_problema
                );


                if (!problema) {

                    problema = {

                        id_problema:
                            linha.id_problema,

                        descricao:
                            linha.descricao_prob,

                        prioridade:
                            linha.prioridade,

                        status:
                            linha.status_problema,

                        execucao:
                            linha.id_execucao
                                ? {

                                    id_execucao:
                                        linha.id_execucao,

                                    data_inicio:
                                        linha.data_inicio,

                                    data_fim:
                                        linha.data_fim,

                                    status:
                                        linha.status_execucao,

                                    funcionario: {

                                        id_funcionario:
                                            linha.id_funcionario,

                                        nome:
                                            linha.nome_funcionario,

                                        especialidade:
                                            linha.especialidade,

                                        telefone:
                                            linha.telefone_funcionario

                                    }

                                }
                                : null,

                        servicos: []

                    };


                    problemas.push(problema);

                }


                if (linha.id_servico) {

                    const existe =
                        problema.servicos.some(
                            (servico) =>
                                servico.id_servico ===
                                linha.id_servico
                        );


                    if (!existe) {

                        problema.servicos.push({

                            id_servico:
                                linha.id_servico,

                            descricao:
                                linha.descricao_serv,

                            tempo_estimado:
                                linha.tempo_estimado,

                            valor_mao_obra:
                                linha.valor_mao_obra

                        });

                    }

                }

            });


            // =================================================
            // 3 - ITEM_OS + SERVIÇO + PEÇA
            // =================================================

            const sqlItens = `
                SELECT
                    io.id_item,
                    io.id_servico,
                    io.id_peca,
                    io.quantidade,
                    io.valor_unitario,
                    io.valor_total,

                    s.descricao_serv,

                    pc.nome_peca,
                    pc.descricao_peca,
                    pc.preco_unitario,
                    pc.estoque

                FROM item_os io

                LEFT JOIN servico s
                    ON s.id_servico = io.id_servico

                LEFT JOIN peca pc
                    ON pc.id_peca = io.id_peca

                WHERE io.id_os = ?;
            `;


            const [itens] = await db.query(
                sqlItens,
                [id]
            );


            const itensFormatados = itens.map(
                (item) => ({

                    id_item:
                        item.id_item,

                    quantidade:
                        item.quantidade,

                    valor_unitario:
                        item.valor_unitario,

                    valor_total:
                        item.valor_total,


                    servico:
                        item.id_servico
                            ? {

                                id_servico:
                                    item.id_servico,

                                descricao:
                                    item.descricao_serv

                            }
                            : null,


                    peca:
                        item.id_peca
                            ? {

                                id_peca:
                                    item.id_peca,

                                nome:
                                    item.nome_peca,

                                descricao:
                                    item.descricao_peca,

                                preco_unitario:
                                    item.preco_unitario,

                                estoque:
                                    item.estoque

                            }
                            : null

                })
            );


            // =================================================
            // 4 - PAGAMENTOS
            // =================================================

            const sqlPagamentos = `
                SELECT
                    id_pagamento,
                    forma_pagamento,
                    valor,
                    status,
                    data_pagamento

                FROM pagamento

                WHERE id_os = ?

                ORDER BY id_pagamento DESC;
            `;


            const [pagamentos] = await db.query(
                sqlPagamentos,
                [id]
            );


            // =================================================
            // 5 - MONTA O OBJETO FINAL
            // =================================================

            const dados = {

                id_os:
                    ordem.id_os,

                data_entrada:
                    ordem.data_entrada,

                data_previsao:
                    ordem.data_previsao,

                data_entrega:
                    ordem.data_entrega,

                status:
                    ordem.status,

                observacoes:
                    ordem.observacoes,

                valor_total:
                    ordem.valor_total,


                cliente: {

                    id_cliente:
                        ordem.id_cliente,

                    nome_cliente:
                        ordem.nome_cliente,

                    cpf:
                        ordem.cpf,

                    telefone:
                        ordem.telefone,

                    email:
                        ordem.email,

                    endereco:
                        ordem.endereco

                },


                veiculo: {

                    id_veiculo:
                        ordem.id_veiculo,

                    placa:
                        ordem.placa,

                    marca:
                        ordem.marca,

                    modelo:
                        ordem.modelo,

                    ano:
                        ordem.ano,

                    cor:
                        ordem.cor,

                    quilometragem:
                        ordem.quilometragem

                },


                problemas:
                    problemas,

                itens:
                    itensFormatados,

                pagamentos:
                    pagamentos

            };


            return response.status(200).json({

                sucesso: true,

                mensagem:
                    'Detalhes da ordem de serviço.',

                dados: dados

            });


        } catch (error) {

            return response.status(500).json({

                sucesso: false,

                mensagem:
                    'Erro ao buscar detalhes da ordem de serviço.',

                dados:
                    error.message

            });

        }

    },


    // =========================================================
    // CADASTRAR ORDEM
    // =========================================================

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
                observacoes || null,
                valor_total || 0

            ];


            const [resultado] = await db.query(
                sql,
                valores
            );


            return response.status(201).json({

                sucesso: true,

                mensagem:
                    'Ordem de serviço cadastrada com sucesso.',

                dados: {

                    id_os:
                        resultado.insertId

                }

            });


        } catch (error) {

            return response.status(500).json({

                sucesso: false,

                mensagem:
                    'Erro ao cadastrar ordem de serviço.',

                dados:
                    error.message

            });

        }

    },


    // =========================================================
    // EDITAR ORDEM
    // =========================================================

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
                observacoes || null,
                valor_total,
                id

            ];


            const [resultado] = await db.query(
                sql,
                valores
            );


            if (resultado.affectedRows === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        `Ordem de serviço ${id} não encontrada.`,

                    dados: null

                });

            }


            return response.status(200).json({

                sucesso: true,

                mensagem:
                    `Ordem de serviço ${id} atualizada com sucesso.`,

                dados: null

            });


        } catch (error) {

            return response.status(500).json({

                sucesso: false,

                mensagem:
                    'Erro ao atualizar ordem de serviço.',

                dados:
                    error.message

            });

        }

    },


    // =========================================================
    // RECALCULAR VALOR DA OS PELOS ITEM_OS
    // =========================================================

    async recalcularValorTotal(request, response) {

        try {

            const { id } = request.params;


            const sqlSoma = `
                SELECT
                    COALESCE(
                        SUM(valor_total),
                        0
                    ) AS total

                FROM item_os

                WHERE id_os = ?;
            `;


            const [resultadoSoma] =
                await db.query(
                    sqlSoma,
                    [id]
                );


            const total =
                resultadoSoma[0].total;


            const sqlAtualizar = `
                UPDATE ordem_servico

                SET valor_total = ?

                WHERE id_os = ?;
            `;


            const [resultado] =
                await db.query(
                    sqlAtualizar,
                    [total, id]
                );


            if (resultado.affectedRows === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        `Ordem de serviço ${id} não encontrada.`,

                    dados: null

                });

            }


            return response.status(200).json({

                sucesso: true,

                mensagem:
                    'Valor total recalculado com sucesso.',

                dados: {

                    id_os:
                        Number(id),

                    valor_total:
                        total

                }

            });


        } catch (error) {

            return response.status(500).json({

                sucesso: false,

                mensagem:
                    'Erro ao recalcular valor total.',

                dados:
                    error.message

            });

        }

    },


    // =========================================================
    // APAGAR ORDEM
    // =========================================================

    async apagarOrdemServico(request, response) {

        try {

            const { id } = request.params;


            const sql = `
                DELETE FROM ordem_servico

                WHERE id_os = ?;
            `;


            const [resultado] = await db.query(
                sql,
                [id]
            );


            if (resultado.affectedRows === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        `Ordem de serviço ${id} não encontrada.`,

                    dados: null

                });

            }


            return response.status(200).json({

                sucesso: true,

                mensagem:
                    `Ordem de serviço ${id} excluída com sucesso.`,

                dados: null

            });


        } catch (error) {

            return response.status(500).json({

                sucesso: false,

                mensagem:
                    'Erro ao excluir ordem de serviço.',

                dados:
                    error.message

            });

        }

    }

};