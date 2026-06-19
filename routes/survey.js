const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const SurveyResponse = require('../models/SurveyResponse');

// POST /api/survey/response - Save survey response
router.post('/response', async (req, res) => {
  try {
    const { user_id, id_pregunta, pregunta, opcion_seleccionada, acierto } = req.body;

    // Validate required fields
    if (!user_id || !id_pregunta || !pregunta || !opcion_seleccionada || acierto === undefined) {
      return res.status(400).json({
        success: false,
        message: 'user_id, id_pregunta, pregunta, opcion_seleccionada, and acierto are required'
      });
    }

    // Validate acierto is boolean
    if (typeof acierto !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'acierto must be a boolean (true or false)'
      });
    }

    // Create survey response
    const surveyResponse = new SurveyResponse({
      user_id,
      id_pregunta,
      pregunta,
      opcion_seleccionada,
      acierto
    });

    await surveyResponse.save();

    console.log(`✅ Survey response saved: User ${user_id} - Question ${id_pregunta} - ${acierto ? 'Correct' : 'Incorrect'}`);

    res.json({
      success: true,
      message: 'Respuesta guardada exitosamente',
      data: {
        response_id: surveyResponse._id,
        user_id: surveyResponse.user_id,
        id_pregunta: surveyResponse.id_pregunta,
        acierto: surveyResponse.acierto,
        timestamp: surveyResponse.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving survey response:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar respuesta',
      error: error.message
    });
  }
});

// GET /api/survey/stats - Get survey statistics
router.get('/stats', async (req, res) => {
  try {
    const totalResponses = await SurveyResponse.countDocuments();
    const correctAnswers = await SurveyResponse.countDocuments({ acierto: true });
    const incorrectAnswers = await SurveyResponse.countDocuments({ acierto: false });
    const uniqueUsers = await SurveyResponse.distinct('user_id');

    // Stats by question
    const questionStats = await SurveyResponse.aggregate([
      {
        $group: {
          _id: '$id_pregunta',
          pregunta: { $first: '$pregunta' },
          total: { $sum: 1 },
          correctos: {
            $sum: { $cond: ['$acierto', 1, 0] }
          },
          incorrectos: {
            $sum: { $cond: ['$acierto', 0, 1] }
          }
        }
      },
      {
        $project: {
          id_pregunta: '$_id',
          pregunta: 1,
          total: 1,
          correctos: 1,
          incorrectos: 1,
          porcentaje_acierto: {
            $multiply: [
              { $divide: ['$correctos', '$total'] },
              100
            ]
          }
        }
      },
      { $sort: { id_pregunta: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        general: {
          total_respuestas: totalResponses,
          respuestas_correctas: correctAnswers,
          respuestas_incorrectas: incorrectAnswers,
          usuarios_unicos: uniqueUsers.length,
          porcentaje_acierto_general: totalResponses > 0
            ? ((correctAnswers / totalResponses) * 100).toFixed(2)
            : 0
        },
        por_pregunta: questionStats
      }
    });

  } catch (error) {
    console.error('Error getting survey stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// GET /api/survey/download - Download all survey responses as Excel
router.get('/download', async (req, res) => {
  try {
    const responses = await SurveyResponse.find({})
      .sort({ createdAt: -1 })
      .lean();

    if (responses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay respuestas de survey para descargar'
      });
    }

    // Format data for Excel with Mexico City timezone
    const formattedData = responses.map(response => ({
      'ID Respuesta': response._id.toString(),
      'User ID': response.user_id,
      'ID Pregunta': response.id_pregunta,
      'Pregunta': response.pregunta,
      'Opción Seleccionada': response.opcion_seleccionada,
      'Acierto': response.acierto ? 'Correcto' : 'Incorrecto',
      'Fecha y Hora': new Date(response.createdAt).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City'
      })
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas Survey');

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(formattedData[0]).map(key => {
      const maxLen = Math.max(
        key.length,
        ...formattedData.map(row => String(row[key]).length)
      );
      return { wch: Math.min(maxLen + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers and send file
    const filename = `Survey_Responses_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

    console.log(`📥 Survey responses downloaded: ${responses.length} respuestas`);

  } catch (error) {
    console.error('Error downloading survey responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar respuestas',
      error: error.message
    });
  }
});

module.exports = router;
