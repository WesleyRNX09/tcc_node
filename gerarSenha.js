const { criarHashSenha } = require('./src/utils/senha');

async function gerarSenha() {

    try {

        const senha = '1234';

        const hash = await criarHashSenha(senha);

        console.log('Senha:', senha);
        console.log('Hash gerado:');
        console.log(hash);

    } catch (error) {

        console.log('Erro ao gerar hash:');
        console.log(error.message);

    }

}

gerarSenha();