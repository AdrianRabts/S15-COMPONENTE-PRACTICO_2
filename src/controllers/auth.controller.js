const userModel = require('../models/user.model');

function registrar(req, res) {
  try {
    const { nombre, email, password, rol } = req.body;
    const usuario = userModel.crear({
      nombre,
      email,
      password,
      rol: rol || 'user',
      activo: 1,
    });

    const sesion = userModel.crearSesion(usuario.id);
    res.status(201).json({ user: usuario, token: sesion.token });
  } catch (error) {
    if (error.codigo === 'EMAIL_DUPLICADO') {
      return res.status(409).json({ error: 'El correo ya esta registrado.' });
    }

    throw error;
  }
}

function iniciarSesion(req, res) {
  const { email, password } = req.body;
  const usuario = userModel.autenticar(email, password);

  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales invalidas o cuenta deshabilitada.' });
  }

  const sesion = userModel.crearSesion(usuario.id);
  res.json({ user: usuario, token: sesion.token });
}

function cerrarSesion(req, res) {
  const token = req.user.token;
  userModel.cerrarSesion(token);
  res.status(204).send();
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  registrar,
  iniciarSesion,
  cerrarSesion,
  me,
};
