const path = require('path');
const express = require('express');
const tareasRoutes = require('./routes/tareas.routes');
const { manejarErrores, rutaNoEncontrada } = require('./middlewares/manejarErrores.middleware');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/tareas', tareasRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(rutaNoEncontrada);
app.use(manejarErrores);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
