const db = require('../dataBase/connection');
const jwt = require('jsonwebtoken');

const TIPOS_USUARIO_PERMITIDOS = [
    'administrador',
    'funcionario'
];


function idValido(valor) {

    const numero = Number(valor);

    return (
        Number.isInteger(numero) &&
        numero > 0
    );

}

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
                senha,
                tipo_usuario
            } = request.body;


            // =====================================================
            // VALIDAR USUÁRIO
            // =====================================================

            if (
                typeof usuario !== 'string' ||
                !usuario.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Usuário é obrigatório.',
                    dados: null
                });

            }


            const usuarioFormatado =
                usuario.trim().toLowerCase();


            if (usuarioFormatado.length < 3) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Usuário deve possuir pelo menos 3 caracteres.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR SENHA
            // =====================================================

            if (
                typeof senha !== 'string' ||
                !senha.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Senha é obrigatória.',
                    dados: null
                });

            }


            // Mantemos 4 para não quebrar seus testes atuais com 1234
            if (senha.length < 4) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Senha deve possuir pelo menos 4 caracteres.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR TIPO DE USUÁRIO
            // =====================================================

            if (
                typeof tipo_usuario !== 'string' ||
                !tipo_usuario.trim()
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Tipo de usuário é obrigatório.',
                    dados: null
                });

            }


            const tipoUsuario =
                tipo_usuario
                    .trim()
                    .toLowerCase();


            if (
                !TIPOS_USUARIO_PERMITIDOS.includes(
                    tipoUsuario
                )
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        `Tipo de usuário inválido. Permitidos: ${TIPOS_USUARIO_PERMITIDOS.join(', ')}.`,
                    dados: null
                });

            }


            // =====================================================
            // FUNCIONÁRIO PRECISA TER UM FUNCIONÁRIO VINCULADO
            // =====================================================

            const possuiFuncionario =
                id_funcionario !== undefined &&
                id_funcionario !== null &&
                id_funcionario !== '';


            if (
                tipoUsuario === 'funcionario' &&
                !possuiFuncionario
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Um login do tipo funcionário precisa estar vinculado a um funcionário.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR FUNCIONÁRIO, SE INFORMADO
            // =====================================================

            if (possuiFuncionario) {

                if (!idValido(id_funcionario)) {

                    return response.status(400).json({
                        sucesso: false,
                        mensagem:
                            'ID do funcionário inválido.',
                        dados: null
                    });

                }


                const sqlFuncionario = `
                    SELECT
                        id_funcionario,
                        id_login

                    FROM funcionario

                    WHERE id_funcionario = ?;
                `;


                const [funcionarios] =
                    await db.query(
                        sqlFuncionario,
                        [id_funcionario]
                    );


                if (funcionarios.length === 0) {

                    return response.status(404).json({
                        sucesso: false,
                        mensagem:
                            'Funcionário não encontrado.',
                        dados: null
                    });

                }


                // Verifica pela tabela login também
                const sqlLoginFuncionario = `
                    SELECT id_login
                    FROM login
                    WHERE id_funcionario = ?;
                `;


                const [loginFuncionario] =
                    await db.query(
                        sqlLoginFuncionario,
                        [id_funcionario]
                    );


                if (
                    funcionarios[0].id_login !== null ||
                    loginFuncionario.length > 0
                ) {

                    return response.status(409).json({
                        sucesso: false,
                        mensagem:
                            'Este funcionário já possui um login.',
                        dados: null
                    });

                }

            }


            // =====================================================
            // VERIFICAR USUÁRIO DUPLICADO
            // =====================================================

            const sqlVerificar = `
                SELECT id_login
                FROM login
                WHERE usuario = ?;
            `;


            const [usuarios] =
                await db.query(
                    sqlVerificar,
                    [usuarioFormatado]
                );


            if (usuarios.length > 0) {

                return response.status(409).json({
                    sucesso: false,
                    mensagem:
                        'Este usuário já está cadastrado.',
                    dados: null
                });

            }


            // =====================================================
            // CRIAR HASH
            // =====================================================

            const senha_hash =
                await criarHashSenha(senha);


            // =====================================================
            // CADASTRAR LOGIN
            // =====================================================

            const sql = `
                INSERT INTO login
                (
                    id_funcionario,
                    usuario,
                    senha_hash,
                    ultimo_login,
                    tipo_usuario
                )

                VALUES (?, ?, ?, NULL, ?);
            `;


            const [resultado] =
                await db.query(
                    sql,
                    [
                        possuiFuncionario
                            ? id_funcionario
                            : null,

                        usuarioFormatado,

                        senha_hash,

                        tipoUsuario
                    ]
                );


            // =====================================================
            // SINCRONIZAR FUNCIONÁRIO COM LOGIN
            // =====================================================

            if (possuiFuncionario) {

                const sqlAtualizarFuncionario = `
                    UPDATE funcionario

                    SET id_login = ?

                    WHERE id_funcionario = ?;
                `;


                await db.query(
                    sqlAtualizarFuncionario,
                    [
                        resultado.insertId,
                        id_funcionario
                    ]
                );

            }


            return response.status(201).json({
                sucesso: true,
                mensagem:
                    'Login cadastrado com sucesso.',
                dados: {
                    id_login:
                        resultado.insertId,

                    usuario:
                        usuarioFormatado,

                    tipo_usuario:
                        tipoUsuario,

                    id_funcionario:
                        possuiFuncionario
                            ? Number(id_funcionario)
                            : null
                }
            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao cadastrar login.',
                dados:
                    error.message
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


            // =====================================================
            // VALIDAR DADOS
            // =====================================================

            if (
                typeof usuario !== 'string' ||
                !usuario.trim() ||
                typeof senha !== 'string' ||
                !senha
            ) {

                return response.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Usuário e senha são obrigatórios.',
                    dados: null
                });

            }


            const usuarioFormatado =
                usuario
                    .trim()
                    .toLowerCase();


            // =====================================================
            // BUSCAR LOGIN
            // =====================================================

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


            const [usuarios] =
                await db.query(
                    sql,
                    [usuarioFormatado]
                );


            if (usuarios.length === 0) {

                return response.status(401).json({
                    sucesso: false,
                    mensagem:
                        'Usuário ou senha inválidos.',
                    dados: null
                });

            }


            const usuarioBanco =
                usuarios[0];


            // =====================================================
            // VERIFICAR SENHA
            // =====================================================

            const senhaCorreta =
                await verificarSenha(
                    senha,
                    usuarioBanco.senha_hash
                );


            if (!senhaCorreta) {

                return response.status(401).json({
                    sucesso: false,
                    mensagem:
                        'Usuário ou senha inválidos.',
                    dados: null
                });

            }


            // =====================================================
            // VALIDAR PERMISSÃO
            // =====================================================

            if (
                !TIPOS_USUARIO_PERMITIDOS.includes(
                    usuarioBanco.tipo_usuario
                )
            ) {

                return response.status(403).json({
                    sucesso: false,
                    mensagem:
                        'Usuário sem tipo de acesso válido.',
                    dados: null
                });

            }


            // =====================================================
            // ATUALIZAR ÚLTIMO LOGIN
            // =====================================================

            const sqlAtualizar = `
                UPDATE login

                SET ultimo_login = NOW()

                WHERE id_login = ?;
            `;


            await db.query(
                sqlAtualizar,
                [usuarioBanco.id_login]
            );


            // =====================================================
            // GERAR JWT
            // =====================================================

            const token = jwt.sign(

                {
                    id_login:
                        usuarioBanco.id_login,

                    id_funcionario:
                        usuarioBanco.id_funcionario,

                    usuario:
                        usuarioBanco.usuario,

                    tipo_usuario:
                        usuarioBanco.tipo_usuario
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: '8h',
                    algorithm: 'HS256'
                }

            );


            return response.status(200).json({

                sucesso: true,

                mensagem:
                    'Login realizado com sucesso.',

                dados: {

                    token:
                        token,

                    id_login:
                        usuarioBanco.id_login,

                    id_funcionario:
                        usuarioBanco.id_funcionario,

                    usuario:
                        usuarioBanco.usuario,

                    tipo_usuario:
                        usuarioBanco.tipo_usuario,

                    nome_funcionario:
                        usuarioBanco.nome_funcionario,

                    especialidade:
                        usuarioBanco.especialidade

                }

            });


        } catch (error) {

            return response.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro ao realizar login.',
                dados:
                    error.message
            });

        }

    }

};