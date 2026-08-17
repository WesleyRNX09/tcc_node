const jwt = require('jsonwebtoken');

function autenticarToken(request, response, next) {

    try {

        const authorization = request.headers.authorization;

        if (!authorization) {

            return response.status(401).json({
                sucesso: false,
                mensagem: 'Token não informado.',
                dados: null
            });

        }

        const partes = authorization.split(' ');

        if (
            partes.length !== 2 ||
            partes[0] !== 'Bearer'
        ) {

            return response.status(401).json({
                sucesso: false,
                mensagem: 'Token inválido.',
                dados: null
            });

        }

        const token = partes[1];

        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ['HS256']
            }
        );

        request.usuario = usuario;

        next();

    } catch (error) {

        return response.status(401).json({
            sucesso: false,
            mensagem: 'Token inválido ou expirado.',
            dados: null
        });

    }

}

module.exports = autenticarToken;