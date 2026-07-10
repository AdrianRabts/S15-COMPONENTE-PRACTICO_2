const userModel = require('../models/user.model');

function listar(req, res) {
  res.json(userModel.obtenerTodos());
}

function crear(req, res) {
  try {
    const { nombre, email, password, rol, activo } = req.body;
    const usuario = userModel.crear({
      nombre,
      email,
      password,
      rol: rol || 'user',
      activo: activo !== undefined ? activo : 1,
    });

    res.status(201).json(usuario);
  } catch (error) {
    if (error.codigo === 'EMAIL_DUPLICADO') {
      return res.status(409).json({ error: 'El correo ya esta registrado.' });
    }

    throw error;
  }
}

function cambiarEstado(req, res) {
  const { id } = req.params;
  const { activo } = req.body;

  if (String(id) === String(req.user.id) && activo === false) {
    return res.status(400).json({ error: 'No puedes deshabilitar tu propia cuenta desde esta sesion.' });
  }

  const usuario = userModel.cambiarEstado(id, activo);

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.json(usuario);
}

function eliminar(req, res) {
  const { id } = req.params;

  if (String(id) === String(req.user.id)) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta desde esta sesion.' });
  }

  const eliminado = userModel.eliminar(id);

  if (!eliminado) {
    return res.status(404).json({ error: 'No se pudo eliminar el usuario.' });
  }

  res.status(204).send();
}

module.exports = {
  listar,
  crear,
  cambiarEstado,
  eliminar,
};
