require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const stockRoutes = require('./routes/stock');
const rouletteRoutes = require('./routes/roulette');
const dominoRoutes = require('./routes/domino');
const cyberRoutes = require('./routes/cyber');
const albumRoutes = require('./routes/album_v2'); // New album system with pack opening
const milexRoutes = require('./routes/roulette_milex');
const ruletaPYRoutes = require('./routes/ruletaPY');
const matchRoutes = require('./routes/match');
const surveyRoutes = require('./routes/survey');
const termsRoutes = require('./routes/terms');
const ruletaPepRoutes = require('./routes/ruleta_pep');

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
      cyberSpin: '/api/cyber/spin - Lanzar la ruleta Cyber',
      cyberWinner: '/api/cyber/winner - Registrar ganador de Cyber',
      cyberStats: '/api/cyber/stats - Obtener estadísticas de Cyber',
      cyberDownload: '/api/cyber/winners/download - Descargar ganadores de Cyber en Excel',
      albumOpenPack: '/api/album/open-pack - Abrir pack de álbum (3 stickers)',
      albumRegisterWinner: '/api/album/register-winner - Registrar pack abierto y ganador',
      albumStats: '/api/album/stats/:album_id - Obtener estadísticas de un álbum específico',
      albumStock: '/api/album/stock/:album_id - Obtener stock de stickers de un álbum',
      albumDownload: '/api/album/winners/download/:album_id - Descargar ganadores de álbum en Excel',
      milexSpin: '/api/milex/spin - Lanzar la ruleta Milex',
      milexWinner: '/api/milex/winner - Registrar ganador de Milex',
      milexStats: '/api/milex/stats - Obtener estadísticas de Milex',
      milexDownload: '/api/milex/winners/download - Descargar ganadores de Milex en Excel',
      ruletaPYSpin: '/api/ruletapy/spin - Lanzar la RuletaPY',
      ruletaPYWinner: '/api/ruletapy/winner - Registrar ganador de RuletaPY',
      ruletaPYStats: '/api/ruletapy/stats - Obtener estadísticas de RuletaPY',
      ruletaPYDownload: '/api/ruletapy/winners/download - Descargar ganadores de RuletaPY en Excel',
      surveyResponse: '/api/survey/response - Guardar respuesta de survey',
      surveyStats: '/api/survey/stats - Obtener estadísticas de survey',
      surveyDownload: '/api/survey/download - Descargar respuestas de survey en Excel',
      termsAccept: '/api/terms - Registrar aceptación de términos y condiciones',
      termsGetAll: '/api/terms - Obtener todas las aceptaciones de términos',
      termsDownload: '/api/terms/download - Descargar aceptaciones de términos en Excel',
      termsByUser: '/api/terms/user/:userid - Obtener aceptaciones por usuario',
      ruletaPepSpin: '/api/ruleta_pep/spin - Lanzar la Ruleta Pepsico (time-window based)',
      ruletaPepWinner: '/api/ruleta_pep/winner - Registrar ganador de Ruleta Pepsico',
      ruletaPepStats: '/api/ruleta_pep/stats - Obtener estadísticas de Ruleta Pepsico',
      ruletaPepDownload: '/api/ruleta_pep/winners/download - Descargar participantes de Ruleta Pepsico en Excel'
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
app.use('/api/cyber', cyberRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/milex', milexRoutes);
app.use('/api/ruletapy', ruletaPYRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/ruleta_pep', ruletaPepRoutes);

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
  console.log(`💻 Cyber endpoint: /api/cyber`);
  console.log(`📖 Album endpoint: /api/album`);
  console.log(`🏥 Milex endpoint: /api/milex`);
  console.log(`🇵🇾 RuletaPY endpoint: /api/ruletapy`);
  console.log(`💚 Health check: /health`);
  console.log(`📥 Download winners: /api/roulette/winners/download`);
  console.log(`📥 Download domino winners: /api/domino/winners/download`);
  console.log(`📥 Download cyber winners: /api/cyber/winners/download`);
  console.log(`📥 Download album winners: /api/album/winners/download`);
  console.log(`📥 Download milex winners: /api/milex/winners/download`);
  console.log(`📥 Download RuletaPY winners: /api/ruletapy/winners/download`);
  console.log(`🥤 RuletaPep endpoint: /api/ruleta_pep`);
  console.log(`📥 Download RuletaPep participants: /api/ruleta_pep/winners/download`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
