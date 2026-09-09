const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const TimeWindowPrize = require('../models/TimeWindowPrize');
const PepsicoWinner = require('../models/PepsicoWinner');

// POST /api/ruleta_pep/spin - Spin based on time windows
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

    const now = new Date();
    console.log(`🎲 User ${user_id} spinning at ${now.toISOString()}`);

    // Find all unclaimed prizes where draw_datetime <= now
    // Sort by draw_datetime ascending (oldest first)
    const availablePrizes = await TimeWindowPrize.find({
      draw_datetime: { $lte: now },
      is_claimed: false
    }).sort({ draw_datetime: 1 });

    if (availablePrizes.length === 0) {
      console.log(`❌ No available prizes for ${user_id}`);
      return res.json({
        success: true,
        winner: false,
        message: 'No ganaste esta vez. ¡Sigue intentando!'
      });
    }

    // The user wins the FIRST (oldest) available prize
    const wonPrize = availablePrizes[0];

    console.log(`🎉 Prize won by ${user_id}: ${wonPrize.prize_name} (draw time: ${wonPrize.draw_datetime.toISOString()})`);
    console.log(`📊 Remaining unclaimed prizes: ${availablePrizes.length - 1}`);

    res.json({
      success: true,
      winner: true,
      message: '¡Felicidades! Has ganado un premio',
      prize: {
        id: wonPrize._id,
        name: wonPrize.prize_name,
        draw_datetime: wonPrize.draw_datetime,
        remaining_unclaimed: availablePrizes.length - 1
      }
    });

  } catch (error) {
    console.error('Error in ruleta_pep spin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al lanzar la ruleta',
      error: error.message
    });
  }
});

// POST /api/ruleta_pep/winner - Register winner or participant
router.post('/winner', async (req, res) => {
  try {
    const { user_id, prize_name, prize_id, is_winner = true } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    let prizeRecord = null;

    // If is a winner, validate and claim the prize
    if (is_winner) {
      if (!prize_id || !prize_name) {
        return res.status(400).json({
          success: false,
          message: 'prize_id and prize_name are required for winners'
        });
      }

      // Find the prize
      prizeRecord = await TimeWindowPrize.findById(prize_id);

      if (!prizeRecord) {
        return res.status(404).json({
          success: false,
          message: 'Prize not found'
        });
      }

      if (prizeRecord.is_claimed) {
        return res.status(400).json({
          success: false,
          message: 'Prize already claimed'
        });
      }

      // Mark prize as claimed
      prizeRecord.is_claimed = true;
      prizeRecord.winner_user_id = user_id;
      prizeRecord.claimed_at = new Date();
      await prizeRecord.save();

      console.log(`✅ Prize claimed: ${prizeRecord.prize_name} by ${user_id}`);
    }

    // Create winner/participant record
    const winnerRecord = new PepsicoWinner({
      user_id,
      is_winner,
      prize_name: is_winner ? prize_name : null,
      prize_id: is_winner ? prize_id : null,
      play_datetime: new Date()
    });

    await winnerRecord.save();

    const logMessage = is_winner
      ? `🎉 Winner registered: ${user_id} won ${prize_name}`
      : `📝 Participant registered: ${user_id} - no prize`;
    console.log(logMessage);

    res.json({
      success: true,
      message: is_winner ? 'Ganador registrado exitosamente' : 'Participación registrada exitosamente',
      data: {
        winner_id: winnerRecord._id,
        user_id: winnerRecord.user_id,
        prize_name: winnerRecord.prize_name,
        prize_id: winnerRecord.prize_id,
        is_winner: winnerRecord.is_winner,
        play_datetime: winnerRecord.play_datetime
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

// GET /api/ruleta_pep/stats - Get ruleta_pep statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();

    // Get total prizes count
    const totalPrizes = await TimeWindowPrize.countDocuments();

    // Get claimed prizes count
    const claimedPrizes = await TimeWindowPrize.countDocuments({ is_claimed: true });

    // Get available prizes (draw_datetime <= now and not claimed)
    const availablePrizes = await TimeWindowPrize.countDocuments({
      draw_datetime: { $lte: now },
      is_claimed: false
    });

    // Get future prizes (draw_datetime > now)
    const futurePrizes = await TimeWindowPrize.countDocuments({
      draw_datetime: { $gt: now }
    });

    // Get total winners
    const totalWinners = await PepsicoWinner.countDocuments({ is_winner: true });

    // Get total participants (losers)
    const totalLosers = await PepsicoWinner.countDocuments({ is_winner: false });

    // Prize breakdown by type
    const prizeBreakdown = await TimeWindowPrize.aggregate([
      {
        $group: {
          _id: '$prize_name',
          total: { $sum: 1 },
          claimed: {
            $sum: { $cond: ['$is_claimed', 1, 0] }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const prizeStats = prizeBreakdown.map(p => ({
      name: p._id,
      total: p.total,
      claimed: p.claimed,
      remaining: p.total - p.claimed
    }));

    // Get first and last prize dates
    const firstPrize = await TimeWindowPrize.findOne().sort({ draw_datetime: 1 });
    const lastPrize = await TimeWindowPrize.findOne().sort({ draw_datetime: -1 });

    res.json({
      success: true,
      system: 'Time Window Based (First Come, First Served)',
      currentTime: now.toISOString(),
      totalPrizes,
      claimedPrizes,
      availablePrizes,
      futurePrizes,
      totalWinners,
      totalParticipants: totalWinners + totalLosers,
      dateRange: {
        start: firstPrize ? firstPrize.draw_datetime : null,
        end: lastPrize ? lastPrize.draw_datetime : null
      },
      prizeBreakdown: prizeStats
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

// GET /api/ruleta_pep/winners/download - Download all participants as Excel
router.get('/winners/download', async (req, res) => {
  try {
    // Fetch all participants from database, sorted by play date (newest first)
    const participants = await PepsicoWinner.find().sort({ play_datetime: -1 });

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
      'Premio': participant.prize_name || 'N/A',
      'ID Premio': participant.prize_id ? participant.prize_id.toString() : 'N/A',
      'Fecha y Hora de Juego': new Date(participant.play_datetime).toLocaleString('es-MX', {
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
      { wch: 30 }, // Premio
      { wch: 25 }, // ID Premio
      { wch: 20 }  // Fecha y Hora de Juego
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes RuletaPep');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const filename = `ruleta_pep_participantes_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${participants.length} participants as Excel: ${filename}`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error downloading participants:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar participantes',
      error: error.message
    });
  }
});

module.exports = router;
