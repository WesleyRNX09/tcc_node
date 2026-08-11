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

            const [resultado] = await db.query(sql, valores);

            if (resultado.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Cliente não encontrado.',
                    dados: null
                });
            }

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