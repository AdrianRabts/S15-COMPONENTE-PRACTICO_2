const path = require('path');
const express = require('express');

require('./db/schema');

const authRoutes = require('./routes/auth.routes');
const tareasRoutes = require('./routes/tareas.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const usersRoutes = require('./routes/users.routes');
const { manejarErrores, rutaNoEncontrada } = require('./middlewares/manejarErrores.middleware');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/analytics', analyticsRoutes);

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
