// Express reconoce este middleware como manejador de errores por tener 4 parámetros (err, req, res, next).
function manejarErrores(err, req, res, next) {
  console.error(err.stack || err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

module.exports = {
  manejarErrores,
  rutaNoEncontrada,
};
