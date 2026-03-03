require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const stockRoutes = require('./routes/stock');
const rouletteRoutes = require('./routes/roulette');

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
      rouletteStats: '/api/roulette/stats - Obtener estadísticas'
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

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Stock endpoint: http://localhost:${PORT}/api/stock`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
