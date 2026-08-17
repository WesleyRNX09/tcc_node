function permitirApenas(...tiposPermitidos) {

    return (request, response, next) => {

        if (!request.usuario) {

            return response.status(401).json({
                sucesso: false,
                mensagem: 'Usuário não autenticado.',
                dados: null
            });

        }


        if (
            !tiposPermitidos.includes(
                request.usuario.tipo_usuario
            )
        ) {

            return response.status(403).json({
                sucesso: false,
                mensagem: 'Você não possui permissão para acessar esta função.',
                dados: null
            });

        }


        next();

    };

}

module.exports = permitirApenas;