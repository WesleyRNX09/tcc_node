const db = require('../dataBase/connection');

module.exports = {

    async listarFuncionarios(request, response) {

        try {

            const sql = `
                SELECT
                    id_funcionario,
                    id_login,
                    nome_funcionario,
                    especialidade,
                    telefone
                FROM funcionario;
            `;

            const [funcionarios] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de funcionários.',
                dados: funcionarios
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

   async cadastrarFuncionario(request, response) {

        try {

            const {
                id_login,
                nome_funcionario,
                especialidade,
                telefone
            } = request.body;

            // Validar nome
            if (
                !nome_funcionario ||
                typeof nome_funcionario !== 'string' ||
                !nome_funcionario.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nome do funcionário é obrigatório.',
                    dados: null
                });

            }

            // Validar especialidade
            if (
                !especialidade ||
                typeof especialidade !== 'string' ||
                !especialidade.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Especialidade é obrigatória.',
                    dados: null
                });

            }

            // Validar telefone
            if (!telefone) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Telefone é obrigatório.',
                    dados: null
                });

            }

            const telefoneFormatado = String(telefone)
                .replace(/\D/g, '');

            if (!/^\d{10,11}$/.test(telefoneFormatado)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Telefone deve possuir 10 ou 11 números.',
                    dados: null
                });

            }

            // Se um login foi informado
            if (
                id_login !== undefined &&
                id_login !== null &&
                id_login !== ''
            ) {

                // Validar ID do login
                if (
                    !Number.isInteger(Number(id_login)) ||
                    Number(id_login) <= 0
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'ID do login inválido.',
                        dados: null
                    });

                }

                // Verificar se login existe
                const sqlLogin = `
                    SELECT id_login
                    FROM login
                    WHERE id_login = ?;
                `;

                const [login] = await db.query(
                    sqlLogin,
                    [id_login]
                );

                if (login.length === 0) {

                    return response.status(404).json({
                        sucesso: false,
                        mensagem: 'Login não encontrado.',
                        dados: null
                    });

                }

                // Verificar se login já está associado a outro funcionário
                const sqlLoginFuncionario = `
                    SELECT id_funcionario
                    FROM funcionario
                    WHERE id_login = ?;
                `;

                const [funcionarioLogin] = await db.query(
                    sqlLoginFuncionario,
                    [id_login]
                );

                if (funcionarioLogin.length > 0) {

                    return response.status(409).json({
                        sucesso: false,
                        mensagem: 'Este login já está associado a um funcionário.',
                        dados: null
                    });

                }

            }

            const sql = `
                INSERT INTO funcionario
                (
                    id_login,
                    nome_funcionario,
                    especialidade,
                    telefone
                )
                VALUES (?, ?, ?, ?);
            `;

            const valores = [
                id_login || null,
                nome_funcionario.trim(),
                especialidade.trim(),
                telefoneFormatado
            ];

            const [resultado] = await db.query(
                sql,
                valores
            );

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Funcionário cadastrado com sucesso.',
                dados: {
                    id_funcionario: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar funcionário.',
                dados: error.message
            });

        }

    },

    async editarFuncionario(request, response) {

        try {

            const { id } = request.params;

            const {
                id_login,
                nome_funcionario,
                especialidade,
                telefone
            } = request.body;

            // Validar ID do funcionário
            if (
                !Number.isInteger(Number(id)) ||
                Number(id) <= 0
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do funcionário inválido.',
                    dados: null
                });

            }

            // Buscar funcionário atual
            const sqlFuncionario = `
                SELECT
                    id_funcionario,
                    id_login,
                    nome_funcionario,
                    especialidade,
                    telefone
                FROM funcionario
                WHERE id_funcionario = ?;
            `;

            const [funcionarios] = await db.query(
                sqlFuncionario,
                [id]
            );

            if (funcionarios.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Funcionário ${id} não encontrado.`,
                    dados: null
                });

            }

            const funcionarioAtual = funcionarios[0];

            // Manter dados antigos quando não forem enviados
            const novoIdLogin =
                id_login !== undefined
                    ? id_login
                    : funcionarioAtual.id_login;

            const novoNome =
                nome_funcionario !== undefined
                    ? nome_funcionario
                    : funcionarioAtual.nome_funcionario;

            const novaEspecialidade =
                especialidade !== undefined
                    ? especialidade
                    : funcionarioAtual.especialidade;

            const novoTelefone =
                telefone !== undefined
                    ? telefone
                    : funcionarioAtual.telefone;

            // Validar nome
            if (
                !novoNome ||
                typeof novoNome !== 'string' ||
                !novoNome.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nome do funcionário é obrigatório.',
                    dados: null
                });

            }

            // Validar especialidade
            if (
                !novaEspecialidade ||
                typeof novaEspecialidade !== 'string' ||
                !novaEspecialidade.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Especialidade é obrigatória.',
                    dados: null
                });

            }

            // Validar telefone
            if (!novoTelefone) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Telefone é obrigatório.',
                    dados: null
                });

            }

            const telefoneFormatado = String(novoTelefone)
                .replace(/\D/g, '');

            if (!/^\d{10,11}$/.test(telefoneFormatado)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Telefone deve possuir 10 ou 11 números.',
                    dados: null
                });

            }

            // Validar login caso exista
            if (
                novoIdLogin !== null &&
                novoIdLogin !== ''
            ) {

                if (
                    !Number.isInteger(Number(novoIdLogin)) ||
                    Number(novoIdLogin) <= 0
                ) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'ID do login inválido.',
                        dados: null
                    });

                }

                // Verificar se login existe
                const sqlLogin = `
                    SELECT id_login
                    FROM login
                    WHERE id_login = ?;
                `;

                const [login] = await db.query(
                    sqlLogin,
                    [novoIdLogin]
                );

                if (login.length === 0) {

                    return response.status(404).json({
                        sucesso: false,
                        mensagem: 'Login não encontrado.',
                        dados: null
                    });

                }

                // Verificar se pertence a outro funcionário
                const sqlLoginFuncionario = `
                    SELECT id_funcionario
                    FROM funcionario
                    WHERE id_login = ?
                    AND id_funcionario <> ?;
                `;

                const [funcionarioLogin] = await db.query(
                    sqlLoginFuncionario,
                    [
                        novoIdLogin,
                        id
                    ]
                );

                if (funcionarioLogin.length > 0) {

                    return response.status(409).json({
                        sucesso: false,
                        mensagem: 'Este login já está associado a outro funcionário.',
                        dados: null
                    });

                }

            }

            const sqlUpdate = `
                UPDATE funcionario
                SET
                    id_login = ?,
                    nome_funcionario = ?,
                    especialidade = ?,
                    telefone = ?
                WHERE id_funcionario = ?;
            `;

            const valores = [
                novoIdLogin || null,
                novoNome.trim(),
                novaEspecialidade.trim(),
                telefoneFormatado,
                id
            ];

            await db.query(
                sqlUpdate,
                valores
            );

            return response.status(200).json({
                sucesso: true,
                mensagem: `Funcionário ${id} atualizado com sucesso.`,
                dados: {
                    id_funcionario: Number(id)
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar funcionário.',
                dados: error.message
            });

        }

    },

    async apagarFuncionario(request, response) {

        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM funcionario
                WHERE id_funcionario = ?;
            `;

            const valores = [id];

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Funcionário ${id} não encontrado.`,
                    dados: null
                });

            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Funcionário ${id} excluído com sucesso.`,
                dados: null
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir funcionário.',
                dados: error.message
            });

        }

    }

};