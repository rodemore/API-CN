const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// GET /api/stock - Obtener todo el stock de premios
router.get('/', async (req, res) => {
  try {
    const stock = await Stock.find().sort({ ID_PREMIO: 1 });

    res.json({
      success: true,
      count: stock.length,
      data: stock
    });
  } catch (error) {
    console.error('Error obteniendo stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el stock',
      error: error.message
    });
  }
});

// GET /api/stock/:id - Obtener un premio específico por ID
router.get('/:id', async (req, res) => {
  try {
    const stock = await Stock.findOne({ ID_PREMIO: req.params.id });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Premio no encontrado'
      });
    }

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error obteniendo premio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el premio',
      error: error.message
    });
  }
});

module.exports = router;
