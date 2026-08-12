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
                nome_funcionario,
                especialidade,
                telefone
            ];

            const [resultado] = await db.query(sql, valores);

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

            const sql = `
                UPDATE funcionario
                SET
                    id_login = ?,
                    nome_funcionario = ?,
                    especialidade = ?,
                    telefone = ?
                WHERE id_funcionario = ?;
            `;

            const valores = [
                id_login || null,
                nome_funcionario,
                especialidade,
                telefone,
                id
            ];

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
                mensagem: `Funcionário ${id} atualizado com sucesso.`,
                dados: null
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