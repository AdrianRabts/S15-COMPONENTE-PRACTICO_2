const crypto = require('crypto');

function crearHashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verificarPassword(password, salt, hashEsperado) {
  const { hash } = crearHashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashEsperado, 'hex'));
}

function crearTokenSeguro() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  crearHashPassword,
  verificarPassword,
  crearTokenSeguro,
};
