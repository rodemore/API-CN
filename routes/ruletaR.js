const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Stock = require('../models/Stock');
const Winner = require('../models/Winner');
const TermsAcceptance = require('../models/TermsAcceptance');
const { ruletar_probability } = require('../config/roulette');

// POST /api/ruletaR/spin - Simulate RuletaR game spin
router.post('/spin', async (req, res) => {
  try {
    const { roulette_id } = req.body;

    // Validate roulette_id (should be 3 for RuletaR)
    if (!roulette_id) {
      return res.status(400).json({
        success: false,
        message: 'roulette_id is required'
      });
    }

    // Generate random number between 0 and 1
    const random = Math.random();

    console.log(`🎲 Generated probability: ${(random * 100).toFixed(2)}%`);
    console.log(`🎯 Win probability: ${(ruletar_probability * 100).toFixed(2)}%`);

    // Check if wins according to probability
    if (random > ruletar_probability) {
      // Didn't win
      return res.json({
        success: true,
        winner: false,
        message: 'No ganaste esta vez. ¡Sigue intentando!'
      });
    }

    // Won! Search for available prizes (with available stock) for RuletaR
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
    console.error('Error in RuletaR spin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al girar la ruleta',
      error: error.message
    });
  }
});

// POST /api/ruletaR/winner - Register winner or participant
router.post('/winner', async (req, res) => {
  try {
    const { user_id, prize, prize_id, roulette_id, is_winner = true } = req.body;

    // Validate required fields
    if (!user_id || !prize || !prize_id || !roulette_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id, prize, prize_id, and roulette_id are required'
      });
    }

    let prizeStock = null;
    let availableStock = 0;

    // Solo validar stock si es un ganador real
    if (is_winner && typeof prize_id === 'number') {
      // Verify prize exists and has available stock
      prizeStock = await Stock.findOne({
        ID_PREMIO: prize_id,
        ID_RULETA: roulette_id
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
    const winner = new Winner({
      user_id,
      prize,
      prize_id,
      roulette_id,
      is_winner
    });

    await winner.save();

    // Increment winners counter in Stock only if is a real winner
    if (is_winner && prizeStock) {
      await Stock.findOneAndUpdate(
        { ID_PREMIO: prize_id, ID_RULETA: roulette_id },
        { $inc: { GANADORES: 1 } }
      );
    }

    const logMessage = is_winner
      ? `🎉 Winner registered: ${user_id} won ${prize}`
      : `📝 Participant registered: ${user_id} - ${prize}`;
    console.log(logMessage);

    res.json({
      success: true,
      message: is_winner ? 'Ganador registrado exitosamente' : 'Participación registrada exitosamente',
      data: {
        winner_id: winner._id,
        user_id: winner.user_id,
        prize: winner.prize,
        prize_id: winner.prize_id,
        roulette_id: winner.roulette_id,
        is_winner: winner.is_winner,
        created_at: winner.createdAt,
        remainingStock: prizeStock ? availableStock - 1 : null
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

// POST /api/ruletaR/terms - Accept terms and conditions
router.post('/terms', async (req, res) => {
  try {
    const { userid, ip_address, user_agent } = req.body;

    // Validate required fields
    if (!userid) {
      return res.status(400).json({
        success: false,
        message: 'userid is required'
      });
    }

    // Check if user already accepted terms for this campaign
    const existingAcceptance = await TermsAcceptance.findOne({
      userid,
      campaign: 'RuletaR'
    });

    if (existingAcceptance) {
      return res.json({
        success: true,
        message: 'Usuario ya aceptó los términos y condiciones',
        data: {
          acceptance_id: existingAcceptance._id,
          userid: existingAcceptance.userid,
          campaign: existingAcceptance.campaign,
          accepted_at: existingAcceptance.accepted_at
        }
      });
    }

    // Create new terms acceptance record
    const acceptance = new TermsAcceptance({
      userid,
      campaign: 'RuletaR',
      ip_address,
      user_agent
    });

    await acceptance.save();

    console.log(`✅ Terms accepted by user: ${userid}`);

    res.json({
      success: true,
      message: 'Términos y condiciones aceptados exitosamente',
      data: {
        acceptance_id: acceptance._id,
        userid: acceptance.userid,
        campaign: acceptance.campaign,
        accepted_at: acceptance.accepted_at
      }
    });

  } catch (error) {
    console.error('Error accepting terms:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aceptar términos y condiciones',
      error: error.message
    });
  }
});

// GET /api/ruletaR/terms/download - Download terms acceptances as Excel
router.get('/terms/download', async (req, res) => {
  try {
    // Fetch all RuletaR terms acceptances from database, sorted by acceptance date (newest first)
    const acceptances = await TermsAcceptance.find({ campaign: 'RuletaR' }).sort({ accepted_at: -1 });

    if (acceptances.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay aceptaciones de términos para descargar'
      });
    }

    // Prepare data for Excel
    const excelData = acceptances.map(acceptance => ({
      'ID': acceptance._id.toString(),
      'Usuario': acceptance.userid,
      'Campaña': acceptance.campaign,
      'IP Address': acceptance.ip_address || 'N/A',
      'User Agent': acceptance.user_agent || 'N/A',
      'Fecha y Hora': new Date(acceptance.accepted_at).toLocaleString('es-MX', {
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
      { wch: 50 }, // Usuario
      { wch: 15 }, // Campaña
      { wch: 20 }, // IP Address
      { wch: 80 }, // User Agent
      { wch: 20 }  // Fecha y Hora
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Términos RuletaR');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const filename = `terminos_ruletaR_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${acceptances.length} RuletaR terms acceptances as Excel: ${filename}`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error downloading terms acceptances:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar aceptaciones de términos',
      error: error.message
    });
  }
});

// GET /api/ruletaR/stats - Get RuletaR statistics
router.get('/stats', async (req, res) => {
  try {
    // Filter prizes for RuletaR (ID_RULETA: 3)
    const prizes = await Stock.find({ ID_RULETA: 3 }).sort({ ID_PREMIO: 1 });

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
      winProbability: `${(ruletar_probability * 100)}%`,
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

// GET /api/ruletaR/winners/download - Download RuletaR winners as Excel
router.get('/winners/download', async (req, res) => {
  try {
    // Fetch all RuletaR winners from database (ID_RULETA: 3), sorted by creation date (newest first)
    const winners = await Winner.find({ roulette_id: 3 }).sort({ createdAt: -1 });

    if (winners.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay ganadores para descargar'
      });
    }

    // Prepare data for Excel
    const excelData = winners.map(winner => ({
      'ID': winner._id.toString(),
      'Usuario (External ID)': winner.user_id,
      'Premio': winner.prize,
      'ID Premio': winner.prize_id,
      'ID Ruleta': winner.roulette_id,
      'Ganador': winner.is_winner !== false ? 'Sí' : 'No',
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
      { wch: 50 }, // Usuario (External ID)
      { wch: 40 }, // Premio
      { wch: 12 }, // ID Premio
      { wch: 12 }, // ID Ruleta
      { wch: 10 }, // Ganador
      { wch: 20 }  // Fecha y Hora
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ganadores RuletaR');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const filename = `ganadores_ruletaR_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${winners.length} RuletaR winners as Excel: ${filename}`);

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
