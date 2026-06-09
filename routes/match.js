const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Match = require('../models/Match');

// POST /api/match - Register a match result
router.post('/', async (req, res) => {
  try {
    const { team1, team2, 'team1-goals': team1Goals, 'team2-goals': team2Goals, userid } = req.body;

    // Validate required fields
    if (!team1 || !team2 || team1Goals === undefined || team2Goals === undefined || !userid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: team1, team2, team1-goals, team2-goals, userid'
      });
    }

    // Validate goals are numbers
    if (isNaN(team1Goals) || isNaN(team2Goals)) {
      return res.status(400).json({
        success: false,
        message: 'Goals must be valid numbers'
      });
    }

    // Create new match record
    const match = new Match({
      team1,
      team2,
      team1_goals: parseInt(team1Goals),
      team2_goals: parseInt(team2Goals),
      userid
    });

    await match.save();

    res.status(201).json({
      success: true,
      message: 'Match registered successfully',
      data: match
    });

  } catch (error) {
    console.error('❌ Error registering match:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering match',
      error: error.message
    });
  }
});

// GET /api/match - Get all matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ created_at: -1 });

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message
    });
  }
});

// GET /api/match/download - Download all matches as Excel
router.get('/download', async (req, res) => {
  try {
    // Fetch all matches from database, sorted by creation date (newest first)
    const matches = await Match.find().sort({ created_at: -1 });

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay partidos para descargar'
      });
    }

    // Prepare data for Excel
    const excelData = matches.map(match => {
      // Determine winner
      let resultado = 'Empate';
      if (match.team1_goals > match.team2_goals) {
        resultado = `Ganó ${match.team1}`;
      } else if (match.team2_goals > match.team1_goals) {
        resultado = `Ganó ${match.team2}`;
      }

      return {
        'ID': match._id.toString(),
        'Usuario': match.userid,
        'Equipo 1': match.team1,
        'Goles Equipo 1': match.team1_goals,
        'Equipo 2': match.team2,
        'Goles Equipo 2': match.team2_goals,
        'Resultado': resultado,
        'Fecha y Hora': new Date(match.created_at).toLocaleString('es-MX', {
          timeZone: 'America/Mexico_City',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const columnWidths = [
      { wch: 25 }, // ID
      { wch: 30 }, // Usuario
      { wch: 25 }, // Equipo 1
      { wch: 15 }, // Goles Equipo 1
      { wch: 25 }, // Equipo 2
      { wch: 15 }, // Goles Equipo 2
      { wch: 30 }, // Resultado
      { wch: 20 }  // Fecha y Hora
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Partidos');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const filename = `partidos_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${matches.length} matches as Excel: ${filename}`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('❌ Error downloading matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar partidos',
      error: error.message
    });
  }
});

// GET /api/match/user/:userid - Get matches by user ID
router.get('/user/:userid', async (req, res) => {
  try {
    const matches = await Match.find({ userid: req.params.userid }).sort({ created_at: -1 });

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('❌ Error fetching user matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user matches',
      error: error.message
    });
  }
});

// GET /api/match/:id - Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('❌ Error fetching match:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching match',
      error: error.message
    });
  }
});

module.exports = router;
