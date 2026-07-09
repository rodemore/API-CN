const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const TermsAcceptance = require('../models/TermsAcceptance');

// POST /api/terms - Register terms and conditions acceptance
router.post('/', async (req, res) => {
  try {
    const { userid, campaign } = req.body;

    // Validate required fields
    if (!userid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: userid'
      });
    }

    // Extract IP address and user agent from request
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];

    // Create new terms acceptance record
    const termsAcceptance = new TermsAcceptance({
      userid,
      campaign: campaign || 'Gloria en la cancha',
      ip_address,
      user_agent
    });

    await termsAcceptance.save();

    res.status(201).json({
      success: true,
      message: 'Terms acceptance registered successfully',
      data: termsAcceptance
    });

  } catch (error) {
    console.error('❌ Error registering terms acceptance:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering terms acceptance',
      error: error.message
    });
  }
});

// GET /api/terms - Get all terms acceptances
router.get('/', async (req, res) => {
  try {
    const { campaign } = req.query;
    const filter = campaign ? { campaign } : {};

    const acceptances = await TermsAcceptance.find(filter).sort({ accepted_at: -1 });

    res.json({
      success: true,
      count: acceptances.length,
      data: acceptances
    });
  } catch (error) {
    console.error('❌ Error fetching terms acceptances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching terms acceptances',
      error: error.message
    });
  }
});

// GET /api/terms/download - Download all terms acceptances as Excel
router.get('/download', async (req, res) => {
  try {
    const { campaign } = req.query;
    const filter = campaign ? { campaign } : {};

    // Fetch all acceptances from database, sorted by acceptance date (newest first)
    const acceptances = await TermsAcceptance.find(filter).sort({ accepted_at: -1 });

    if (acceptances.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay aceptaciones de términos para descargar'
      });
    }

    // Prepare data for Excel
    const excelData = acceptances.map(acceptance => {
      return {
        'ID': acceptance._id.toString(),
        'Usuario': acceptance.userid,
        'Campaña': acceptance.campaign,
        'IP': acceptance.ip_address || 'N/A',
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
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const columnWidths = [
      { wch: 25 }, // ID
      { wch: 30 }, // Usuario
      { wch: 30 }, // Campaña
      { wch: 20 }, // IP
      { wch: 50 }, // User Agent
      { wch: 20 }  // Fecha y Hora
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Términos y Condiciones');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const campaignSuffix = campaign ? `_${campaign.replace(/\s+/g, '_')}` : '';
    const filename = `terminos_condiciones${campaignSuffix}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${acceptances.length} terms acceptances as Excel: ${filename}`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('❌ Error downloading terms acceptances:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar aceptaciones de términos',
      error: error.message
    });
  }
});

// GET /api/terms/user/:userid - Get terms acceptances by user ID
router.get('/user/:userid', async (req, res) => {
  try {
    const acceptances = await TermsAcceptance.find({ userid: req.params.userid }).sort({ accepted_at: -1 });

    res.json({
      success: true,
      count: acceptances.length,
      data: acceptances
    });
  } catch (error) {
    console.error('❌ Error fetching user terms acceptances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user terms acceptances',
      error: error.message
    });
  }
});

// GET /api/terms/:id - Get terms acceptance by ID
router.get('/:id', async (req, res) => {
  try {
    const acceptance = await TermsAcceptance.findById(req.params.id);

    if (!acceptance) {
      return res.status(404).json({
        success: false,
        message: 'Terms acceptance not found'
      });
    }

    res.json({
      success: true,
      data: acceptance
    });
  } catch (error) {
    console.error('❌ Error fetching terms acceptance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching terms acceptance',
      error: error.message
    });
  }
});

module.exports = router;
