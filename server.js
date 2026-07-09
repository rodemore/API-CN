require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const stockRoutes = require('./routes/stock');
const rouletteRoutes = require('./routes/roulette');
const dominoRoutes = require('./routes/domino');
const albumRoutes = require('./routes/album_v2'); // New album system with pack opening
const milexRoutes = require('./routes/roulette_milex');
const matchRoutes = require('./routes/match');
const surveyRoutes = require('./routes/survey');
const termsRoutes = require('./routes/terms');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB();

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: '🎰 API de Ruleta',
    version: '1.0.0',
    endpoints: {
      health: '/health - Health check endpoint',
      stock: '/api/stock - Obtener todo el stock de premios',
      stockById: '/api/stock/:id - Obtener un premio específico',
      rouletteSpin: '/api/roulette/spin - Lanzar la ruleta',
      rouletteWinner: '/api/roulette/winner - Registrar ganador',
      rouletteStats: '/api/roulette/stats - Obtener estadísticas',
      rouletteDownload: '/api/roulette/winners/download - Descargar ganadores en Excel',
      dominoSpin: '/api/domino/spin - Lanzar el dominó',
      dominoWinner: '/api/domino/winner - Registrar ganador de dominó',
      dominoStats: '/api/domino/stats - Obtener estadísticas de dominó',
      dominoDownload: '/api/domino/winners/download - Descargar ganadores de dominó en Excel',
      albumOpenPack: '/api/album/open-pack - Abrir pack de álbum (3 stickers)',
      albumRegisterWinner: '/api/album/register-winner - Registrar pack abierto y ganador',
      albumStats: '/api/album/stats/:album_id - Obtener estadísticas de un álbum específico',
      albumStock: '/api/album/stock/:album_id - Obtener stock de stickers de un álbum',
      albumDownload: '/api/album/winners/download/:album_id - Descargar ganadores de álbum en Excel',
      milexSpin: '/api/milex/spin - Lanzar la ruleta Milex',
      milexWinner: '/api/milex/winner - Registrar ganador de Milex',
      milexStats: '/api/milex/stats - Obtener estadísticas de Milex',
      milexDownload: '/api/milex/winners/download - Descargar ganadores de Milex en Excel',
      surveyResponse: '/api/survey/response - Guardar respuesta de survey',
      surveyStats: '/api/survey/stats - Obtener estadísticas de survey',
      surveyDownload: '/api/survey/download - Descargar respuestas de survey en Excel',
      termsAccept: '/api/terms - Registrar aceptación de términos y condiciones',
      termsGetAll: '/api/terms - Obtener todas las aceptaciones de términos',
      termsDownload: '/api/terms/download - Descargar aceptaciones de términos en Excel',
      termsByUser: '/api/terms/user/:userid - Obtener aceptaciones por usuario'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    status: 'healthy',
    checks: {
      server: 'operational'
    }
  };

  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      healthcheck.checks.database = 'connected';
    } else {
      healthcheck.checks.database = 'disconnected';
      healthcheck.status = 'degraded';
      healthcheck.message = 'Database connection issue';
    }

    // Return appropriate status code
    const statusCode = healthcheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'unhealthy';
    healthcheck.message = error.message;
    healthcheck.checks.error = error.message;
    res.status(503).json(healthcheck);
  }
});

app.use('/api/stock', stockRoutes);
app.use('/api/roulette', rouletteRoutes);
app.use('/api/domino', dominoRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/milex', milexRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/terms', termsRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📦 Stock endpoint: /api/stock`);
  console.log(`🎰 Roulette endpoint: /api/roulette`);
  console.log(`🎲 Domino endpoint: /api/domino`);
  console.log(`📖 Album endpoint: /api/album`);
  console.log(`🏥 Milex endpoint: /api/milex`);
  console.log(`💚 Health check: /health`);
  console.log(`📥 Download winners: /api/roulette/winners/download`);
  console.log(`📥 Download domino winners: /api/domino/winners/download`);
  console.log(`📥 Download album winners: /api/album/winners/download`);
  console.log(`📥 Download milex winners: /api/milex/winners/download`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
