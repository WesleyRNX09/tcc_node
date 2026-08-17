const db = require('../dataBase/connection');
const jwt = require('jsonwebtoken');

const {
    criarHashSenha,
    verificarSenha
} = require('../utils/senha');


module.exports = {

    // =============================================
    // CADASTRAR LOGIN
    // =============================================

    async cadastrarLogin(request, response) {

        try {

            const {
                id_funcionario,
                usuario,
                senha
            } = request.body;


            if (!usuario || !senha) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Usuário e senha são obrigatórios.',
                    dados: null
                });

            }


            // Verifica se usuário já existe
            const sqlVerificar = `
                SELECT id_login
                FROM login
                WHERE usuario = ?;
            `;


            const [usuarios] = await db.query(
                sqlVerificar,
                [usuario]
            );


            if (usuarios.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Este usuário já está cadastrado.',
                    dados: null
                });

            }


            // Cria hash da senha
            const senha_hash = await criarHashSenha(senha);


            const sql = `
                INSERT INTO login
                (
                    id_funcionario,
                    usuario,
                    senha_hash,
                    ultimo_login
                )
                VALUES (?, ?, ?, NULL);
            `;


            const [resultado] = await db.query(
                sql,
                [
                    id_funcionario || null,
                    usuario,
                    senha_hash
                ]
            );


            return response.status(201).json({
                sucesso: true,
                mensagem: 'Login cadastrado com sucesso.',
                dados: {
                    id_login: resultado.insertId,
                    usuario: usuario
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar login.',
                dados: error.message
            });

        }

    },


    // =============================================
    // AUTENTICAR
    // =============================================

    async autenticar(request, response) {

        try {

            const {
                usuario,
                senha
            } = request.body;


            if (!usuario || !senha) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Usuário e senha são obrigatórios.',
                    dados: null
                });

            }


            const sql = `
                SELECT
                    l.id_login,
                    l.id_funcionario,
                    l.usuario,
                    l.senha_hash,
                    l.tipo_usuario,

                    f.nome_funcionario,
                    f.especialidade

                FROM login l

                LEFT JOIN funcionario f
                    ON f.id_funcionario = l.id_funcionario

                WHERE l.usuario = ?;
            `;


            const [usuarios] = await db.query(
                sql,
                [usuario]
            );


            if (usuarios.length === 0) {

                return response.status(401).json({
                    sucesso: false,
                    mensagem: 'Usuário ou senha inválidos.',
                    dados: null
                });

            }


            const usuarioBanco = usuarios[0];


            const senhaCorreta = await verificarSenha(
                senha,
                usuarioBanco.senha_hash
            );


            if (!senhaCorreta) {

                return response.status(401).json({
                    sucesso: false,
                    mensagem: 'Usuário ou senha inválidos.',
                    dados: null
                });

            }


            // Atualiza último login
            const sqlAtualizar = `
                UPDATE login
                SET ultimo_login = NOW()
                WHERE id_login = ?;
            `;


            await db.query(
                sqlAtualizar,
                [usuarioBanco.id_login]
            );

            const token = jwt.sign(
                {
                    id_login: usuarioBanco.id_login,
                    id_funcionario: usuarioBanco.id_funcionario,
                    usuario: usuarioBanco.usuario,
                    tipo_usuario: usuarioBanco.tipo_usuario
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: '8h',
                    algorithm: 'HS256'
                }
            );


            return response.status(200).json({

            sucesso: true,

            mensagem: 'Login realizado com sucesso.',

            dados: {

                token: token,

                id_login: usuarioBanco.id_login,

                id_funcionario: usuarioBanco.id_funcionario,

                usuario: usuarioBanco.usuario,

                tipo_usuario: usuarioBanco.tipo_usuario,

                nome_funcionario: usuarioBanco.nome_funcionario,

                especialidade: usuarioBanco.especialidade

            }

        });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao realizar login.',
                dados: error.message
            });

        }

    }

};