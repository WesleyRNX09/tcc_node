const db = require('../dataBase/connection');

// =========================================================
// VALIDAÇÕES DA ORDEM DE SERVIÇO
// =========================================================

// Ajuste esta lista caso os nomes dos status
// no seu banco sejam diferentes.
const STATUS_OS_PERMITIDOS = [
    'Aberta',
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


            // =====================================================
            // CAMPOS OBRIGATÓRIOS
            // =====================================================

            if (
                !id_cliente ||
                !id_veiculo ||
                !data_entrada ||
                !status
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'Cliente, veículo, data de entrada e status são obrigatórios.',

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR ID DO CLIENTE
            // =====================================================

            if (!idValido(id_cliente)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'ID do cliente inválido.',

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR ID DO VEÍCULO
            // =====================================================

            if (!idValido(id_veiculo)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'ID do veículo inválido.',

                    dados: null

                });

            }


            // =====================================================
            // VERIFICAR SE CLIENTE EXISTE
            // =====================================================

            const sqlCliente = `
                SELECT id_cliente
                FROM cliente
                WHERE id_cliente = ?;
            `;


            const [clientes] =
                await db.query(
                    sqlCliente,
                    [id_cliente]
                );


            if (clientes.length === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        'Cliente não encontrado.',

                    dados: null

                });

            }


            // =====================================================
            // VERIFICAR SE VEÍCULO EXISTE
            // =====================================================

            const sqlVeiculo = `
                SELECT
                    id_veiculo,
                    id_cliente

                FROM veiculo

                WHERE id_veiculo = ?;
            `;


            const [veiculos] =
                await db.query(
                    sqlVeiculo,
                    [id_veiculo]
                );


            if (veiculos.length === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        'Veículo não encontrado.',

                    dados: null

                });

            }


            // =====================================================
            // VERIFICAR SE VEÍCULO PERTENCE AO CLIENTE
            // =====================================================

            const veiculo = veiculos[0];


            if (
                Number(veiculo.id_cliente) !==
                Number(id_cliente)
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'O veículo informado não pertence ao cliente informado.',

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR DATA DE ENTRADA
            // =====================================================

            if (!dataValida(data_entrada)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'Data de entrada inválida.',

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR DATA DE PREVISÃO
            // =====================================================

            if (data_previsao) {

                if (!dataValida(data_previsao)) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'Data de previsão inválida.',

                        dados: null

                    });

                }


                if (
                    dataAnterior(
                        data_previsao,
                        data_entrada
                    )
                ) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'A data de previsão não pode ser anterior à data de entrada.',

                        dados: null

                    });

                }

            }


            // =====================================================
            // VALIDAR DATA DE ENTREGA
            // =====================================================

            if (data_entrega) {

                if (!dataValida(data_entrega)) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'Data de entrega inválida.',

                        dados: null

                    });

                }


                if (
                    dataAnterior(
                        data_entrega,
                        data_entrada
                    )
                ) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'A data de entrega não pode ser anterior à data de entrada.',

                        dados: null

                    });

                }

            }


            // =====================================================
            // VALIDAR STATUS
            // =====================================================

            if (
                typeof status !== 'string' ||
                !STATUS_OS_PERMITIDOS.includes(
                    status.trim()
                )
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        `Status inválido. Permitidos: ${STATUS_OS_PERMITIDOS.join(', ')}.`,

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR VALOR TOTAL
            // =====================================================

            let valorTotalFinal = 0;


            if (valor_total !== undefined) {

                if (
                    valor_total === null ||
                    valor_total === '' ||
                    Number.isNaN(Number(valor_total)) ||
                    Number(valor_total) < 0
                ) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'Valor total deve ser um número maior ou igual a zero.',

                        dados: null

                    });

                }


                valorTotalFinal =
                    Number(valor_total);

            }


            // =====================================================
            // CADASTRAR
            // =====================================================

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
                status.trim(),
                observacoes || null,
                valorTotalFinal

            ];


            const [resultado] =
                await db.query(
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


            // =====================================================
            // VALIDAR ID DA OS
            // =====================================================

            if (!idValido(id)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'ID da ordem de serviço inválido.',

                    dados: null

                });

            }


            // =====================================================
            // BUSCAR OS ATUAL
            // =====================================================

            const sqlOrdemAtual = `
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

                FROM ordem_servico

                WHERE id_os = ?;
            `;


            const [ordens] =
                await db.query(
                    sqlOrdemAtual,
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


            const ordemAtual =
                ordens[0];


            // =====================================================
            // MONTAR NOVOS VALORES
            // =====================================================

            const novoIdCliente =
                id_cliente !== undefined
                    ? id_cliente
                    : ordemAtual.id_cliente;


            const novoIdVeiculo =
                id_veiculo !== undefined
                    ? id_veiculo
                    : ordemAtual.id_veiculo;


            const novaDataEntrada =
                data_entrada !== undefined
                    ? data_entrada
                    : ordemAtual.data_entrada;


            const novaDataPrevisao =
                data_previsao !== undefined
                    ? (
                        data_previsao === ''
                            ? null
                            : data_previsao
                    )
                    : ordemAtual.data_previsao;


            const novaDataEntrega =
                data_entrega !== undefined
                    ? (
                        data_entrega === ''
                            ? null
                            : data_entrega
                    )
                    : ordemAtual.data_entrega;


            const novoStatus =
                status !== undefined
                    ? status
                    : ordemAtual.status;


            const novasObservacoes =
                observacoes !== undefined
                    ? observacoes
                    : ordemAtual.observacoes;


            const novoValorTotal =
                valor_total !== undefined
                    ? valor_total
                    : ordemAtual.valor_total;


            // =====================================================
            // VALIDAR CLIENTE E VEÍCULO
            // =====================================================

            if (!idValido(novoIdCliente)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'ID do cliente inválido.',

                    dados: null

                });

            }


            if (!idValido(novoIdVeiculo)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'ID do veículo inválido.',

                    dados: null

                });

            }


            // =====================================================
            // CLIENTE PRECISA EXISTIR
            // =====================================================

            const sqlCliente = `
                SELECT id_cliente
                FROM cliente
                WHERE id_cliente = ?;
            `;


            const [clientes] =
                await db.query(
                    sqlCliente,
                    [novoIdCliente]
                );


            if (clientes.length === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        'Cliente não encontrado.',

                    dados: null

                });

            }


            // =====================================================
            // VEÍCULO PRECISA EXISTIR
            // =====================================================

            const sqlVeiculo = `
                SELECT
                    id_veiculo,
                    id_cliente

                FROM veiculo

                WHERE id_veiculo = ?;
            `;


            const [veiculos] =
                await db.query(
                    sqlVeiculo,
                    [novoIdVeiculo]
                );


            if (veiculos.length === 0) {

                return response.status(404).json({

                    sucesso: false,

                    mensagem:
                        'Veículo não encontrado.',

                    dados: null

                });

            }


            // =====================================================
            // VEÍCULO PRECISA PERTENCER AO CLIENTE
            // =====================================================

            if (
                Number(veiculos[0].id_cliente) !==
                Number(novoIdCliente)
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'O veículo informado não pertence ao cliente informado.',

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR DATA DE ENTRADA
            // =====================================================

            if (!dataValida(novaDataEntrada)) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'Data de entrada inválida.',

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR DATA DE PREVISÃO
            // =====================================================

            if (novaDataPrevisao) {

                if (!dataValida(novaDataPrevisao)) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'Data de previsão inválida.',

                        dados: null

                    });

                }


                if (
                    dataAnterior(
                        novaDataPrevisao,
                        novaDataEntrada
                    )
                ) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'A data de previsão não pode ser anterior à data de entrada.',

                        dados: null

                    });

                }

            }


            // =====================================================
            // VALIDAR DATA DE ENTREGA
            // =====================================================

            if (novaDataEntrega) {

                if (!dataValida(novaDataEntrega)) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'Data de entrega inválida.',

                        dados: null

                    });

                }


                if (
                    dataAnterior(
                        novaDataEntrega,
                        novaDataEntrada
                    )
                ) {

                    return response.status(400).json({

                        sucesso: false,

                        mensagem:
                            'A data de entrega não pode ser anterior à data de entrada.',

                        dados: null

                    });

                }

            }


            // =====================================================
            // VALIDAR STATUS
            // =====================================================

            if (
                typeof novoStatus !== 'string' ||
                !STATUS_OS_PERMITIDOS.includes(
                    novoStatus.trim()
                )
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        `Status inválido. Permitidos: ${STATUS_OS_PERMITIDOS.join(', ')}.`,

                    dados: null

                });

            }


            // =====================================================
            // VALIDAR VALOR TOTAL
            // =====================================================

            if (
                novoValorTotal === null ||
                novoValorTotal === '' ||
                Number.isNaN(Number(novoValorTotal)) ||
                Number(novoValorTotal) < 0
            ) {

                return response.status(400).json({

                    sucesso: false,

                    mensagem:
                        'Valor total deve ser um número maior ou igual a zero.',

                    dados: null

                });

            }


            // =====================================================
            // ATUALIZAR
            // =====================================================

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

                novoIdCliente,
                novoIdVeiculo,
                novaDataEntrada,
                novaDataPrevisao,
                novaDataEntrega,
                novoStatus.trim(),
                novasObservacoes,
                Number(novoValorTotal),
                id

            ];


            await db.query(
                sql,
                valores
            );


            return response.status(200).json({

                sucesso: true,

                mensagem:
                    `Ordem de serviço ${id} atualizada com sucesso.`,

                dados: {
                    id_os: Number(id)
                }

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