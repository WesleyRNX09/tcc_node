const db = require('../dataBase/connection');

module.exports = {

    async listarClientes(request, response) {

        try {

            const sql = `
                SELECT
                    id_cliente,
                    nome_cliente,
                    cpf,
                    telefone,
                    email,
                    endereco
                FROM cliente;
            `;

            const [clientes] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de clientes.',
                dados: clientes
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });

        }

    },

    async cadastrarCliente(request, response) {

        try {

            const {
                nome_cliente,
                cpf,
                telefone,
                email,
                endereco
            } = request.body;

            if (!nome_cliente || !cpf || !telefone || !email || !endereco) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Todos os campos são obrigatórios.',
                    dados: null
                });

            }

            if (!/^\d{11}$/.test(cpf)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'CPF deve possuir exatamente 11 números.',
                    dados: null
                });

            }

            const sqlCpf = `
                SELECT id_cliente
                FROM cliente
                WHERE cpf = ?;
            `;

            const [clienteCpf] = await db.query(
                sqlCpf,
                [cpf]
            );

            if (clienteCpf.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'CPF já cadastrado.',
                    dados: null
                });

            }

            const sqlEmail = `
                SELECT id_cliente
                FROM cliente
                WHERE email = ?;
            `;

            const [clienteEmail] = await db.query(
                sqlEmail,
                [email]
            );

            if (clienteEmail.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Email já cadastrado.',
                    dados: null
                });

            }

            const sql = `
                INSERT INTO cliente
                (
                    nome_cliente,
                    cpf,
                    telefone,
                    email,
                    endereco
                )
                VALUES (?, ?, ?, ?, ?);
            `;

            const valores = [
                nome_cliente,
                cpf,
                telefone,
                email,
                endereco
            ];

            const [resultado] = await db.query(sql, valores);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Cliente cadastrado com sucesso.',
                dados: {
                    id_cliente: resultado.insertId
                }
            });

        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar cliente.',
                dados: error.message
            });

        }

    },

    async editarCliente(request, response) {

        try {

            const { id } = request.params;

            const {
                nome_cliente,
                cpf,
                telefone,
                email,
                endereco
            } = request.body;


            // =========================================
            // CAMPOS OBRIGATÓRIOS
            // =========================================

            if (!nome_cliente || !cpf || !telefone || !email || !endereco) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Todos os campos são obrigatórios.',
                    dados: null
                });

            }


            // =========================================
            // CPF
            // =========================================

            if (!/^\d{11}$/.test(cpf)) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'CPF deve possuir exatamente 11 números.',
                    dados: null
                });

            }


            // =========================================
            // VERIFICA SE CLIENTE EXISTE
            // =========================================

            const sqlCliente = `
                SELECT id_cliente
                FROM cliente
                WHERE id_cliente = ?;
            `;

            const [clienteExiste] = await db.query(
                sqlCliente,
                [id]
            );

            if (clienteExiste.length === 0) {

                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Cliente não encontrado.',
                    dados: null
                });

            }


            // =========================================
            // CPF DUPLICADO
            // =========================================

            const sqlCpf = `
                SELECT id_cliente
                FROM cliente
                WHERE cpf = ?
                AND id_cliente <> ?;
            `;

            const [clienteCpf] = await db.query(
                sqlCpf,
                [cpf, id]
            );

            if (clienteCpf.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'CPF já cadastrado para outro cliente.',
                    dados: null
                });

            }


            // =========================================
            // EMAIL DUPLICADO
            // =========================================

            const sqlEmail = `
                SELECT id_cliente
                FROM cliente
                WHERE email = ?
                AND id_cliente <> ?;
            `;

            const [clienteEmail] = await db.query(
                sqlEmail,
                [email, id]
            );

            if (clienteEmail.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Email já cadastrado para outro cliente.',
                    dados: null
                });

            }


            // =========================================
            // UPDATE
            // =========================================

            const sql = `
                UPDATE cliente
                SET
                    nome_cliente = ?,
                    cpf = ?,
                    telefone = ?,
                    email = ?,
                    endereco = ?
                WHERE id_cliente = ?;
            `;

            const valores = [
                nome_cliente,
                cpf,
                telefone,
                email,
                endereco,
                id
            ];

            await db.query(sql, valores);


            return response.status(200).json({
                sucesso: true,
                mensagem: 'Cliente atualizado com sucesso.',
                dados: null
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar cliente.',
                dados: error.message
            });

        }

    },

    async apagarCliente(request, response) {

    try {

        const { id } = request.params;

        const sql = `
            DELETE FROM cliente
            WHERE id_cliente = ?;
        `;

        const valores = [id];

        const [resultado] = await db.query(sql, valores);

        if (resultado.affectedRows === 0) {

            return response.status(404).json({
                sucesso: false,
                mensagem: `Cliente ${id} não encontrado.`,
                dados: null
            });

        }

        return response.status(200).json({
            sucesso: true,
            mensagem: `Cliente ${id} excluído com sucesso.`,
            dados: null
        });
        
    } catch (error) {

        return response.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir cliente.',
            dados: error.message
        });

    }

}

};