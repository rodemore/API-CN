require('dotenv').config();
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const AlbumStock = require('../models/AlbumStock');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

async function loadARGStock() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const excelPath = './Files/PremiosARG.xlsx';
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

    // Delete existing ARG stock
    const deleteResult = await AlbumStock.deleteMany({ ALBUM_ID: 'ARG' });
    console.log(`🗑️  Eliminados ${deleteResult.deletedCount} registros ARG anteriores`);

    // Insert new stock
    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        await AlbumStock.create({
          ALBUM_ID: row.ALBUM_ID,
          STICKER_ID: row.STICKER_ID,
          STICKER_NAME: row.STICKER_NAME,
          STICKER_URL: row.STICKER_URL,
          PRIZE_POINTS: row.PRIZE_POINTS,
          BRAND: row.BRAND,
          IS_PRIZE: row.IS_PRIZE,
          STOCK: row.STOCK,
          GANADORES: 0
        });
        successCount++;
        console.log(`✅ [${successCount}/${data.length}] ${row.STICKER_NAME}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error en ${row.STICKER_NAME}:`, error.message);
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`   ✅ Insertados exitosamente: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📦 Total procesado: ${data.length}`);

    // Verify what was loaded
    const argStock = await AlbumStock.find({ ALBUM_ID: 'ARG' }).sort({ PRIZE_POINTS: -1, BRAND: 1 });
    console.log(`\n🔍 Verificación: ${argStock.length} stickers ARG en base de datos`);

    console.log('\n📋 Stock ARG cargado:');
    argStock.forEach(s => {
      console.log(`   - ${s.STICKER_NAME} (${s.BRAND}): ${s.PRIZE_POINTS}pts, Stock: ${s.STOCK}`);
    });

    console.log('\n✅ Carga completada exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

loadARGStock();
