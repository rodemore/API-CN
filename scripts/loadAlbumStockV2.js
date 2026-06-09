require('dotenv').config();
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const AlbumStock = require('../models/AlbumStock');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

async function loadAlbumStock() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Get album ID from command line args (default to HN)
    const albumArg = process.argv[2] || 'HN';
    const excelPath = `./Files/AlbumStock${albumArg}.xlsx`;
    console.log(`📂 Leyendo archivo: ${excelPath}`);

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📊 Encontradas ${data.length} filas en el Excel`);

    if (data.length === 0) {
      console.log('⚠️ No se encontraron datos en el archivo Excel');
      process.exit(0);
    }

    // Obtener ALBUM_ID del primer registro para saber qué álbum limpiar
    const firstAlbumId = data[0]?.ALBUM_ID?.toString().toUpperCase();

    console.log(`🗑️ Limpiando álbum ${firstAlbumId} de la colección...`);
    const deleteResult = await AlbumStock.deleteMany({ ALBUM_ID: firstAlbumId });
    console.log(`   Eliminados ${deleteResult.deletedCount} registros del álbum ${firstAlbumId}`);

    console.log('💾 Insertando nuevos stickers del álbum...');

    let insertedCount = 0;
    const errors = [];

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.ALBUM_ID || !row.STICKER_ID || !row.STICKER_NAME || !row.STICKER_URL) {
          errors.push(`Fila sin campos requeridos: ${JSON.stringify(row)}`);
          continue;
        }

        // Parse prize points (default to 0 if not specified)
        const prizePoints = parseInt(row.PRIZE_POINTS) || 0;
        const isPrize = prizePoints > 0;

        // Parse stock (default to 0)
        const stock = parseInt(row.STOCK) || 0;

        // Brand validation
        const brand = (row.BRAND || 'other').toLowerCase();
        if (!['sv', 'mu', 'pilsener', 'other'].includes(brand)) {
          errors.push(`Marca inválida en fila: ${row.STICKER_ID} - ${brand}`);
          continue;
        }

        const albumSticker = new AlbumStock({
          ALBUM_ID: row.ALBUM_ID.toString().toUpperCase(),
          STICKER_ID: row.STICKER_ID.toString(),
          STICKER_NAME: row.STICKER_NAME.toString(),
          STICKER_URL: row.STICKER_URL.toString(),
          PRIZE_POINTS: prizePoints,
          BRAND: brand,
          IS_PRIZE: isPrize,
          STOCK: stock,
          GANADORES: 0
        });

        await albumSticker.save();
        insertedCount++;

        console.log(`   ✓ ${row.STICKER_ID} - ${row.STICKER_NAME} (${prizePoints}pts, Stock: ${stock})`);
      } catch (error) {
        errors.push(`Error en fila ${row.STICKER_ID}: ${error.message}`);
      }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - ${insertedCount} stickers insertados correctamente`);

    if (errors.length > 0) {
      console.log(`\n⚠️ Errores encontrados (${errors.length}):`);
      errors.forEach(err => console.log(`   - ${err}`));
    }

    // Show summary by album and prize type
    const albums = await AlbumStock.distinct('ALBUM_ID');
    console.log(`\n📊 Resumen por álbum:`);

    for (const albumId of albums) {
      const prizeStickers = await AlbumStock.find({ ALBUM_ID: albumId, IS_PRIZE: true });
      const noPrizeStickers = await AlbumStock.find({ ALBUM_ID: albumId, IS_PRIZE: false });

      const totalPrizeStock = prizeStickers.reduce((sum, s) => sum + s.STOCK, 0);

      console.log(`\n   ${albumId}:`);
      console.log(`   - Stickers con premio: ${prizeStickers.length} (Stock total: ${totalPrizeStock})`);
      console.log(`   - Stickers sin premio: ${noPrizeStickers.length}`);

      // Group by prize points
      const by20k = prizeStickers.filter(s => s.PRIZE_POINTS === 20000);
      const by1k = prizeStickers.filter(s => s.PRIZE_POINTS === 1000);
      const by200 = prizeStickers.filter(s => s.PRIZE_POINTS === 200);

      if (by20k.length > 0) {
        const stock = by20k.reduce((sum, s) => sum + s.STOCK, 0);
        console.log(`     • 20000pts: ${by20k.length} stickers, ${stock} stock`);
      }
      if (by1k.length > 0) {
        const stock = by1k.reduce((sum, s) => sum + s.STOCK, 0);
        console.log(`     • 1000pts: ${by1k.length} stickers, ${stock} stock`);
      }
      if (by200.length > 0) {
        const stock = by200.reduce((sum, s) => sum + s.STOCK, 0);
        console.log(`     • 200pts: ${by200.length} stickers, ${stock} stock`);
      }
    }

    console.log('\n🎉 Stock del álbum cargado exitosamente\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

loadAlbumStock();
