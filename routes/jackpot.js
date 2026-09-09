const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const JackpotStock = require('../models/JackpotStock');
const JackpotWinner = require('../models/JackpotWinner');

// POST /api/jackpot/spin - Simulate jackpot spin with individual prize probabilities
router.post('/spin', async (req, res) => {
  try {
    const { user_id } = req.body;

    // Validate user_id
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Get all prizes with available stock
    const availablePrizes = await JackpotStock.find({
      $expr: { $gt: [{ $subtract: ['$Stock', '$GANADORES'] }, 0] }
    });

    if (availablePrizes.length === 0) {
      return res.json({
        success: true,
        winner: false,
        message: 'Lo sentimos, no hay premios disponibles en este momento'
      });
    }

    // Calculate total probability (sum of all individual probabilities)
    const totalProbability = availablePrizes.reduce((sum, p) => sum + p.PROBABILIDAD, 0);

    // Generate random number between 0 and 100
    const random = Math.random() * 100;

    console.log(`🎲 User ${user_id} - Random: ${random.toFixed(4)}% vs Total Probability: ${totalProbability.toFixed(4)}%`);

    // Check if wins according to total probability
    if (random > totalProbability) {
      // Didn't win
      console.log(`❌ User ${user_id} lost (${random.toFixed(4)}% > ${totalProbability.toFixed(4)}%)`);
      return res.json({
        success: true,
        winner: false,
        message: 'No ganaste esta vez. ¡Sigue intentando!'
      });
    }

    // Won! Now select which prize using individual probabilities as weights
    // Generate another random number for prize selection
    let prizeRandom = Math.random() * totalProbability;
    let wonPrize = null;

    for (const prize of availablePrizes) {
      prizeRandom -= prize.PROBABILIDAD;
      if (prizeRandom <= 0) {
        wonPrize = prize;
        break;
      }
    }

    // Fallback in case of rounding errors
    if (!wonPrize) {
      wonPrize = availablePrizes[availablePrizes.length - 1];
    }

    const availableStock = wonPrize.Stock - wonPrize.GANADORES;

    console.log(`🎉 User ${user_id} won: ${wonPrize.PUNTOS} puntos (Available stock: ${availableStock})`);

    res.json({
      success: true,
      winner: true,
      message: '¡Felicidades! Has ganado un premio',
      prize: {
        id: wonPrize.ID_PREMIO,
        puntos: wonPrize.PUNTOS,
        probabilidad: wonPrize.PROBABILIDAD,
        remainingStock: availableStock
      }
    });

  } catch (error) {
    console.error('Error in jackpot spin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al lanzar el jackpot',
      error: error.message
    });
  }
});

// POST /api/jackpot/winner - Register winner or participant
router.post('/winner', async (req, res) => {
  try {
    const { user_id, puntos, prize_id, is_winner = true } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    let prizeStock = null;
    let availableStock = 0;

    // Only validate stock if is a real winner
    if (is_winner) {
      if (!prize_id || !puntos) {
        return res.status(400).json({
          success: false,
          message: 'prize_id and puntos are required for winners'
        });
      }

      // Verify prize exists and has available stock
      prizeStock = await JackpotStock.findOne({
        ID_PREMIO: prize_id
      });

      if (!prizeStock) {
        return res.status(404).json({
          success: false,
          message: 'Prize not found'
        });
      }

      availableStock = prizeStock.Stock - prizeStock.GANADORES;
      if (availableStock <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay stock disponible para este premio'
        });
      }
    }

    // Create winner/participant record
    const winner = new JackpotWinner({
      user_id,
      puntos: is_winner ? puntos : null,
      prize_id: is_winner ? prize_id : null,
      is_winner
    });

    await winner.save();

    // Increment winners counter in Stock only if is a real winner
    if (is_winner && prizeStock) {
      await JackpotStock.findOneAndUpdate(
        { ID_PREMIO: prize_id },
        { $inc: { GANADORES: 1 } }
      );
    }

    const logMessage = is_winner
      ? `🎉 Jackpot winner registered: ${user_id} won ${puntos} puntos`
      : `📝 Participant registered: ${user_id} - no win`;
    console.log(logMessage);

    res.json({
      success: true,
      message: is_winner ? 'Ganador registrado exitosamente' : 'Participación registrada exitosamente',
      data: {
        winner_id: winner._id,
        user_id: winner.user_id,
        puntos: winner.puntos,
        prize_id: winner.prize_id,
        is_winner: winner.is_winner,
        created_at: winner.createdAt,
        remainingStock: prizeStock ? availableStock - 1 : null
      }
    });

  } catch (error) {
    console.error('Error registering jackpot winner:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar ganador',
      error: error.message
    });
  }
});

// GET /api/jackpot/stats - Get jackpot statistics
router.get('/stats', async (req, res) => {
  try {
    const prizes = await JackpotStock.find().sort({ ID_PREMIO: 1 });

    const stats = prizes.map(prize => ({
      id: prize.ID_PREMIO,
      puntos: prize.PUNTOS,
      probabilidad: prize.PROBABILIDAD,
      totalStock: prize.Stock,
      winners: prize.GANADORES,
      available: prize.Stock - prize.GANADORES
    }));

    const totalWinners = prizes.reduce((sum, p) => sum + p.GANADORES, 0);
    const totalStock = prizes.reduce((sum, p) => sum + p.Stock, 0);
    const totalProbability = prizes.reduce((sum, p) => sum + p.PROBABILIDAD, 0);

    // Get total participants (winners + losers)
    const totalParticipants = await JackpotWinner.countDocuments();
    const totalLosers = await JackpotWinner.countDocuments({ is_winner: false });

    res.json({
      success: true,
      system: 'Jackpot with Individual Prize Probabilities',
      totalProbability: `${totalProbability.toFixed(4)}%`,
      loseProbability: `${(100 - totalProbability).toFixed(4)}%`,
      totalStock,
      totalWinners,
      totalParticipants,
      totalLosers,
      prizes: stats
    });

  } catch (error) {
    console.error('Error getting jackpot statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// GET /api/jackpot/winners/download - Download winners as Excel
router.get('/winners/download', async (req, res) => {
  try {
    // Fetch all jackpot participants from database, sorted by creation date (newest first)
    const participants = await JackpotWinner.find().sort({ createdAt: -1 });

    if (participants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay participantes para descargar'
      });
    }

    // Prepare data for Excel
    const excelData = participants.map(participant => ({
      'ID': participant._id.toString(),
      'Usuario (External ID)': participant.user_id,
      'Ganador': participant.is_winner ? 'Sí' : 'No',
      'Puntos': participant.puntos || 'N/A',
      'ID Premio': participant.prize_id || 'N/A',
      'Fecha y Hora': new Date(participant.createdAt).toLocaleString('es-MX', {
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
      { wch: 50 }, // Usuario (External ID)
      { wch: 10 }, // Ganador
      { wch: 15 }, // Puntos
      { wch: 12 }, // ID Premio
      { wch: 20 }  // Fecha y Hora
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes Jackpot');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const filename = `jackpot_participantes_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${participants.length} jackpot participants as Excel: ${filename}`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error downloading jackpot participants:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar participantes',
      error: error.message
    });
  }
});

module.exports = router;
