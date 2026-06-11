const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const AlbumStock = require('../models/AlbumStock');
const AlbumWinner = require('../models/AlbumWinner');

// Probability distribution for prize points
// 200pts: 75%, 1000pts: 23%, 20000pts: 2%
function getRandomPrizePoints() {
  const random = Math.random();
  if (random < 0.75) return 200;
  if (random < 0.98) return 1000;
  return 20000;
}

// POST /api/album/open-pack - Open a pack and receive 3 stickers
router.post('/open-pack', async (req, res) => {
  try {
    const { album_id, user_id, brand } = req.body;

    // Validate required fields
    if (!album_id) {
      return res.status(400).json({
        success: false,
        message: 'album_id is required (e.g., HN, GT, SV)'
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Step 1: Determine pack composition based on album
    // ZA album with specific brands (carling, castle, fish): 3 prize stickers (all with prize)
    // ZA AllBrands and other albums: 2 non-prize + 1 prize
    const isZASpecificBrand = album_id === 'ZA' && brand && ['carling', 'castle', 'fish'].includes(brand);
    const isZAAlbum = isZASpecificBrand;
    let selectedNoPrize = [];

    if (!isZAAlbum) {
      // Get 2 random non-prize stickers (PRIZE_POINTS = 0) without repeating
      const noPrizeStickers = await AlbumStock.find({
        ALBUM_ID: album_id,
        IS_PRIZE: false,
        PRIZE_POINTS: 0
      });

      if (noPrizeStickers.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Not enough non-prize stickers available for this album'
        });
      }

      // Randomly select 2 non-prize stickers without repetition
      const shuffled = [...noPrizeStickers].sort(() => 0.5 - Math.random());
      selectedNoPrize = shuffled.slice(0, 2);
    }

    // Step 2 & 3: Get ALL available prize stickers with stock
    const allPrizeStickers = await AlbumStock.find({
      ALBUM_ID: album_id,
      IS_PRIZE: true,
      $expr: { $gt: [{ $subtract: ['$STOCK', '$GANADORES'] }, 0] }
    });

    if (allPrizeStickers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay premios disponibles en este momento. Intenta más tarde.'
      });
    }

    // Step 3: Select prize stickers using weighted random selection
    // For ZA: select 3 prize stickers
    // For other albums: select 1 prize sticker
    const numPrizeStickers = isZAAlbum ? 3 : 1;
    const selectedPrizeStickers = [];

    // Function to select a prize sticker with weighted probability
    function selectWeightedPrize(availablePrizes) {
      const prizesWithWeights = availablePrizes.map(prize => ({
        prize,
        availableStock: prize.STOCK - prize.GANADORES
      }));

      const totalWeight = prizesWithWeights.reduce((sum, item) => sum + item.availableStock, 0);
      let randomWeight = Math.random() * totalWeight;

      for (const item of prizesWithWeights) {
        randomWeight -= item.availableStock;
        if (randomWeight <= 0) {
          return item.prize;
        }
      }

      // Fallback
      return prizesWithWeights[prizesWithWeights.length - 1].prize;
    }

    // Select the required number of prize stickers
    for (let i = 0; i < numPrizeStickers; i++) {
      const selectedPrize = selectWeightedPrize(allPrizeStickers);
      selectedPrizeStickers.push(selectedPrize);
      console.log(`🎲 Selected prize ${i + 1}: ${selectedPrize.STICKER_NAME} (${selectedPrize.PRIZE_POINTS}pts, Available: ${selectedPrize.STOCK - selectedPrize.GANADORES})`);
    }

    // For compatibility, use the first prize as the main prize
    const selectedPrizeSticker = selectedPrizeStickers[0];

    // Step 4: Compose the 3-sticker pack
    let packStickers = [];

    if (isZAAlbum) {
      // ZA album: 3 prize stickers
      packStickers = selectedPrizeStickers.map(prize => ({
        sticker_id: prize.STICKER_ID,
        sticker_name: prize.STICKER_NAME,
        sticker_url: prize.STICKER_URL,
        prize_points: prize.PRIZE_POINTS,
        brand: prize.BRAND,
        is_prize: true
      }));
    } else {
      // Other albums: 2 non-prize + 1 prize
      packStickers = [
        {
          sticker_id: selectedNoPrize[0].STICKER_ID,
          sticker_name: selectedNoPrize[0].STICKER_NAME,
          sticker_url: selectedNoPrize[0].STICKER_URL,
          prize_points: 0,
          brand: selectedNoPrize[0].BRAND,
          is_prize: false
        },
        {
          sticker_id: selectedNoPrize[1].STICKER_ID,
          sticker_name: selectedNoPrize[1].STICKER_NAME,
          sticker_url: selectedNoPrize[1].STICKER_URL,
          prize_points: 0,
          brand: selectedNoPrize[1].BRAND,
          is_prize: false
        },
        {
          sticker_id: selectedPrizeSticker.STICKER_ID,
          sticker_name: selectedPrizeSticker.STICKER_NAME,
          sticker_url: selectedPrizeSticker.STICKER_URL,
          prize_points: selectedPrizeSticker.PRIZE_POINTS,
          brand: selectedPrizeSticker.BRAND,
          is_prize: true
        }
      ];
    }

    // Calculate total prize points
    const total_prize_points = isZAAlbum
      ? selectedPrizeStickers.reduce((sum, prize) => sum + prize.PRIZE_POINTS, 0)
      : selectedPrizeSticker.PRIZE_POINTS;

    const remainingStock = selectedPrizeSticker.STOCK - selectedPrizeSticker.GANADORES;

    console.log(`🎉 Pack opened for user ${user_id} in album ${album_id}`);
    if (isZAAlbum) {
      console.log(`   Prizes (ZA - all prize pack):`);
      selectedPrizeStickers.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.STICKER_NAME} (${p.PRIZE_POINTS}pts)`);
      });
      console.log(`   Total points: ${total_prize_points}pts`);
    } else {
      console.log(`   Prize: ${selectedPrizeSticker.STICKER_NAME} (${selectedPrizeSticker.PRIZE_POINTS}pts)`);
      console.log(`   Remaining stock: ${remainingStock}`);
    }

    res.json({
      success: true,
      message: '¡Pack abierto exitosamente!',
      data: {
        album_id,
        user_id,
        pack_stickers: packStickers,
        total_prize_points: total_prize_points,
        prize_sticker: {
          sticker_id: selectedPrizeSticker.STICKER_ID,
          sticker_name: selectedPrizeSticker.STICKER_NAME,
          prize_points: selectedPrizeSticker.PRIZE_POINTS
        },
        remaining_stock: remainingStock - 1 // Will be decremented when winner is registered
      }
    });

  } catch (error) {
    console.error('Error opening pack:', error);
    res.status(500).json({
      success: false,
      message: 'Error al abrir el pack',
      error: error.message
    });
  }
});

// POST /api/album/register-winner - Register pack opening and update stock
router.post('/register-winner', async (req, res) => {
  try {
    const { user_id, album_id, pack_stickers, total_prize_points, prize_sticker } = req.body;

    // Validate required fields
    if (!user_id || !album_id || !pack_stickers || total_prize_points === undefined || !prize_sticker) {
      return res.status(400).json({
        success: false,
        message: 'user_id, album_id, pack_stickers, total_prize_points, and prize_sticker are required'
      });
    }

    // Validate pack has exactly 3 stickers
    if (!Array.isArray(pack_stickers) || pack_stickers.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'pack_stickers must be an array with exactly 3 stickers'
      });
    }

    // Verify the prize sticker has available stock
    const prizeStock = await AlbumStock.findOne({
      ALBUM_ID: album_id,
      STICKER_ID: prize_sticker.sticker_id
    });

    if (!prizeStock) {
      return res.status(404).json({
        success: false,
        message: 'Prize sticker not found in stock'
      });
    }

    const availableStock = prizeStock.STOCK - prizeStock.GANADORES;
    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay stock disponible para este premio'
      });
    }

    // Create winner record
    const winner = new AlbumWinner({
      user_id,
      album_id,
      pack_stickers,
      total_prize_points,
      prize_sticker
    });

    await winner.save();

    // Increment GANADORES counter for the prize sticker
    await AlbumStock.findOneAndUpdate(
      { ALBUM_ID: album_id, STICKER_ID: prize_sticker.sticker_id },
      { $inc: { GANADORES: 1 } }
    );

    console.log(`✅ Winner registered: ${user_id} won ${total_prize_points}pts in album ${album_id}`);

    res.json({
      success: true,
      message: 'Ganador registrado exitosamente',
      data: {
        winner_id: winner._id,
        user_id: winner.user_id,
        album_id: winner.album_id,
        total_prize_points: winner.total_prize_points,
        prize_sticker: winner.prize_sticker,
        created_at: winner.createdAt,
        remaining_stock: availableStock - 1
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

// GET /api/album/stats/:album_id - Get statistics for a specific album
router.get('/stats/:album_id', async (req, res) => {
  try {
    const { album_id } = req.params;

    // Get all stickers for this album
    const stickers = await AlbumStock.find({ ALBUM_ID: album_id }).sort({ PRIZE_POINTS: -1, STICKER_ID: 1 });

    if (stickers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No stickers found for album ${album_id}`
      });
    }

    // Calculate statistics
    const prizeStickers = stickers.filter(s => s.IS_PRIZE);
    const noPrizeStickers = stickers.filter(s => !s.IS_PRIZE);

    const totalPrizesAwarded = prizeStickers.reduce((sum, s) => sum + s.GANADORES, 0);
    const totalPrizeStock = prizeStickers.reduce((sum, s) => sum + s.STOCK, 0);
    const totalPrizesAvailable = prizeStickers.reduce((sum, s) => sum + (s.STOCK - s.GANADORES), 0);

    // Group prize stickers by points
    const prizesByPoints = {
      20000: prizeStickers.filter(s => s.PRIZE_POINTS === 20000),
      1000: prizeStickers.filter(s => s.PRIZE_POINTS === 1000),
      200: prizeStickers.filter(s => s.PRIZE_POINTS === 200)
    };

    const prizeStats = Object.entries(prizesByPoints).map(([points, stickers]) => {
      const totalStock = stickers.reduce((sum, s) => sum + s.STOCK, 0);
      const totalAwarded = stickers.reduce((sum, s) => sum + s.GANADORES, 0);
      return {
        prize_points: parseInt(points),
        total_stock: totalStock,
        awarded: totalAwarded,
        available: totalStock - totalAwarded,
        stickers: stickers.map(s => ({
          sticker_id: s.STICKER_ID,
          sticker_name: s.STICKER_NAME,
          brand: s.BRAND,
          stock: s.STOCK,
          awarded: s.GANADORES,
          available: s.STOCK - s.GANADORES
        }))
      };
    });

    res.json({
      success: true,
      album_id,
      prize_probabilities: {
        '200pts': '75%',
        '1000pts': '23%',
        '20000pts': '2%'
      },
      summary: {
        total_prize_stock: totalPrizeStock,
        total_prizes_awarded: totalPrizesAwarded,
        total_prizes_available: totalPrizesAvailable,
        total_non_prize_stickers: noPrizeStickers.length
      },
      prizes_by_points: prizeStats,
      non_prize_stickers: noPrizeStickers.map(s => ({
        sticker_id: s.STICKER_ID,
        sticker_name: s.STICKER_NAME,
        brand: s.BRAND
      }))
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// GET /api/album/stock/:album_id - Get all stickers for a specific album
router.get('/stock/:album_id', async (req, res) => {
  try {
    const { album_id } = req.params;

    const stickers = await AlbumStock.find({ ALBUM_ID: album_id }).sort({ IS_PRIZE: -1, PRIZE_POINTS: -1 });

    if (stickers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No stickers found for album ${album_id}`
      });
    }

    res.json({
      success: true,
      album_id,
      total_stickers: stickers.length,
      stickers: stickers.map(s => ({
        sticker_id: s.STICKER_ID,
        sticker_name: s.STICKER_NAME,
        sticker_url: s.STICKER_URL,
        prize_points: s.PRIZE_POINTS,
        brand: s.BRAND,
        is_prize: s.IS_PRIZE,
        total_stock: s.STOCK,
        awarded: s.GANADORES,
        available: s.STOCK - s.GANADORES
      }))
    });

  } catch (error) {
    console.error('Error getting stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener stock',
      error: error.message
    });
  }
});

// GET /api/album/winners/download/:album_id - Download winners for a specific album as Excel
router.get('/winners/download/:album_id', async (req, res) => {
  try {
    const { album_id } = req.params;

    // Fetch all winners for this album, sorted by creation date (newest first)
    const winners = await AlbumWinner.find({ album_id }).sort({ createdAt: -1 });

    if (winners.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay ganadores para el álbum ${album_id}`
      });
    }

    // Prepare data for Excel
    const excelData = winners.map(winner => ({
      'ID': winner._id.toString(),
      'Usuario': winner.user_id,
      'Álbum': winner.album_id,
      'Puntos Ganados': winner.total_prize_points,
      'Sticker Premio': winner.prize_sticker.sticker_name,
      'ID Sticker Premio': winner.prize_sticker.sticker_id,
      'Sticker 1': winner.pack_stickers[0]?.sticker_name || '',
      'Sticker 2': winner.pack_stickers[1]?.sticker_name || '',
      'Sticker 3': winner.pack_stickers[2]?.sticker_name || '',
      'Fecha y Hora': new Date(winner.createdAt).toLocaleString('es-MX', {
        timeZone: 'America/Tegucigalpa',
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
      { wch: 10 }, // Álbum
      { wch: 15 }, // Puntos Ganados
      { wch: 30 }, // Sticker Premio
      { wch: 15 }, // ID Sticker Premio
      { wch: 30 }, // Sticker 1
      { wch: 30 }, // Sticker 2
      { wch: 30 }, // Sticker 3
      { wch: 20 }  // Fecha y Hora
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Ganadores ${album_id}`);

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const now = new Date();
    const filename = `ganadores_album_${album_id}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📥 Downloaded ${winners.length} winners for album ${album_id} as Excel: ${filename}`);

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
