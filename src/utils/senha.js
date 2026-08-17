const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);

async function criarHashSenha(senha) {

    const salt = crypto.randomBytes(16).toString('hex');

    const hash = await scrypt(
        senha,
        salt,
        64
    );

    return `${salt}:${hash.toString('hex')}`;
}


async function verificarSenha(senha, senhaSalva) {

    const [salt, hashOriginal] = senhaSalva.split(':');

    if (!salt || !hashOriginal) {
        return false;
    }

    const hashTeste = await scrypt(
        senha,
        salt,
        64
    );

    const bufferOriginal = Buffer.from(
        hashOriginal,
        'hex'
    );

    const bufferTeste = Buffer.from(hashTeste);

    if (bufferOriginal.length !== bufferTeste.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        bufferOriginal,
        bufferTeste
    );
}


module.exports = {
    criarHashSenha,
    verificarSenha
};