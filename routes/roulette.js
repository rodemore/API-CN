const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Stock = require('../models/Stock');
const Winner = require('../models/Winner');
const { gloria_probability } = require('../config/roulette');

// POST /api/roulette/spin - Simulate roulette spin
router.post('/spin', async (req, res) => {
  try {
    const { roulette_id } = req.body;

    // Validate roulette_id
    if (!roulette_id) {
      return res.status(400).json({
        success: false,
        message: 'roulette_id is required'
      });
    }

    // Generate random number between 0 and 1
    const random = Math.random();

    console.log(`🎲 Generated probability: ${(random * 100).toFixed(2)}%`);
    console.log(`🎯 Win probability: ${(gloria_probability * 100).toFixed(2)}%`);

    // Check if wins according to probability
    if (random > gloria_probability) {
      // Didn't win
      return res.json({
        success: true,
        winner: false,
        message: 'No ganaste esta vez. ¡Sigue intentando!'
      });
    }

    // Won! Search for available prizes (with available stock) for this roulette
    const availablePrizes = await Stock.find({
      ID_RULETA: roulette_id,
      $expr: { $gt: [{ $subtract: ['$Stock', '$GANADORES'] }, 0] }
    });

    if (availablePrizes.length === 0) {
      return res.json({
        success: true,
        winner: false,
        message: 'Lo sentimos, no hay premios disponibles en este momento'
      });
    }

    // Select a random prize using weighted probability based on available stock
    // Calculate available stock for each prize
    const prizesWithWeights = availablePrizes.map(prize => ({
      prize,
      availableStock: prize.Stock - prize.GANADORES
    }));

    // Calculate total available stock (sum of all weights)
    const totalWeight = prizesWithWeights.reduce((sum, item) => sum + item.availableStock, 0);

    // Generate random number between 0 and totalWeight
    let randomWeight = Math.random() * totalWeight;

    // Select prize based on weighted probability
    let wonPrize = null;
    for (const item of prizesWithWeights) {
      randomWeight -= item.availableStock;
      if (randomWeight <= 0) {
        wonPrize = item.prize;
        break;
      }
    }

    // Fallback in case of rounding errors
    if (!wonPrize) {
      wonPrize = prizesWithWeights[prizesWithWeights.length - 1].prize;
    }

    console.log(`🎉 Prize won: ${wonPrize.PREMIO} (Available stock: ${wonPrize.Stock - wonPrize.GANADORES})`);

    res.json({
      success: true,
      winner: true,
      message: '¡Felicidades! Has ganado un premio',
      prize: {
        id: wonPrize.ID_PREMIO,
        name: wonPrize.PREMIO,
        roulette_id: wonPrize.ID_RULETA,
        remainingStock: wonPrize.Stock - wonPrize.GANADORES
      }
    });

  } catch (error) {
    console.error('Error in roulette spin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al lanzar la ruleta',
      error: error.message
    });
  }
});

// POST /api/roulette/winner - Register winner
router.post('/winner', async (req, res) => {
  try {
    const { user_id, prize, prize_id, roulette_id } = req.body;

    // Validate required fields
    if (!user_id || !prize || !prize_id || !roulette_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id, prize, prize_id, and roulette_id are required'
      });
    }

    // Verify prize exists and has available stock
    const prizeStock = await Stock.findOne({
      ID_PREMIO: prize_id,
      ID_RULETA: roulette_id
    });

    if (!prizeStock) {
      return res.status(404).json({
        success: false,
        message: 'Prize not found'
      });
    }

    const availableStock = prizeStock.Stock - prizeStock.GANADORES;
    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay stock disponible para este premio'
      });
    }

    // Create winner record
    const winner = new Winner({
      user_id,
      prize,
      prize_id,
      roulette_id
    });

    await winner.save();

    // Increment winners counter in Stock
    await Stock.findOneAndUpdate(
      { ID_PREMIO: prize_id, ID_RULETA: roulette_id },
      { $inc: { GANADORES: 1 } }
    );

    console.log(`🎉 Winner registered: ${user_id} won ${prize}`);

    res.json({
      success: true,
      message: 'Ganador registrado exitosamente',
      data: {
        winner_id: winner._id,
        user_id: winner.user_id,
        prize: winner.prize,
        prize_id: winner.prize_id,
        roulette_id: winner.roulette_id,
        created_at: winner.createdAt,
        remainingStock: availableStock - 1
      }
    });

  } catch (error) {
    console.error('Error registering winner:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar ganador',
      error: error.message
    });
  }
});

// GET /api/roulette/stats - Get roulette statistics
router.get('/stats', async (req, res) => {
  try {
    const prizes = await Stock.find().sort({ ID_PREMIO: 1 });

    const stats = prizes.map(prize => ({
      id: prize.ID_PREMIO,
      name: prize.PREMIO,
      totalStock: prize.Stock,
      winners: prize.GANADORES,
      available: prize.Stock - prize.GANADORES
    }));

    const totalWinners = prizes.reduce((sum, p) => sum + p.GANADORES, 0);

    res.json({
      success: true,
      winProbability: `${(gloria_probability * 100)}%`,
      totalWinners,
      prizes: stats
    });

  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// GET /api/roulette/winners/download - Download winners as Excel
router.get('/winners/download', async (req, res) => {
  try {
    // Fetch all winners from database, sorted by creation date (newest first)
    const winners = await Winner.find().sort({ createdAt: -1 });

    if (winners.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay ganadores para descargar'
      });
    }

    // Prepare data for Excel
    const excelData = winners.map(winner => ({
      'ID': winner._id.toString(),
      'Usuario': winner.user_id,
      'Premio': winner.prize,
      'ID Premio': winner.prize_id,
      'ID Ruleta': winner.roulette_id,
      'Fecha y Hora': new Date(winner.createdAt).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const columnWidths = [
      { wch: 25 }, // ID
      { wch: 15 }, // Usuario
      { wch: 30 }, // Premio
      { wch: 12 }, // ID Premio
      { wch: 12 }, // ID Ruleta
      { wch: 20 }  // Fecha y Hora
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ganadores');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const filename = `ganadores_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${winners.length} winners as Excel: ${filename}`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error downloading winners:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar ganadores',
      error: error.message
    });
  }
});

module.exports = router;
