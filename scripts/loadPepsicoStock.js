require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const TimeWindowPrize = require('../models/TimeWindowPrize');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

async function loadPepsicoStock() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Read Excel file
    const filePath = path.join(__dirname, '..', 'Timewindow-Pepsico_Modo_Turbo (2) (1).xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Set-Out 2026 - Modo Turbo';

    if (!workbook.SheetNames.includes(sheetName)) {
      console.error('❌ No se encontró la hoja:', sheetName);
      console.log('Hojas disponibles:', workbook.SheetNames);
      process.exit(1);
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`📊 Total de filas en Excel: ${data.length}`);

    // Skip header row and filter out September 8th
    const rows = data.slice(1).filter(row => {
      if (!row[1]) return false;
      const dateStr = row[1];
      // Exclude September 8th
      return !dateStr.startsWith('2026-09-08');
    });

    console.log(`📊 Filas después de excluir 8 de septiembre: ${rows.length}`);

    // Clear existing data
    await TimeWindowPrize.deleteMany({});
    console.log('🗑️  Datos anteriores eliminados');

    // Prepare prizes for bulk insert
    const prizes = rows.map(row => {
      const prizeName = row[0] ? row[0].trim() : '';
      const drawDatetime = new Date(row[1]);

      return {
        prize_name: prizeName,
        draw_datetime: drawDatetime,
        is_claimed: false,
        winner_user_id: null,
        claimed_at: null
      };
    });

    // Insert all prizes
    const result = await TimeWindowPrize.insertMany(prizes);
    console.log(`✅ ${result.length} premios cargados exitosamente`);

    // Show statistics
    const prizeStats = await TimeWindowPrize.aggregate([
      {
        $group: {
          _id: '$prize_name',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📈 Estadísticas de premios:');
    prizeStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    // Show date range
    const firstPrize = await TimeWindowPrize.findOne().sort({ draw_datetime: 1 });
    const lastPrize = await TimeWindowPrize.findOne().sort({ draw_datetime: -1 });

    console.log('\n📅 Rango de fechas:');
    console.log(`  Primer premio: ${firstPrize.draw_datetime.toISOString()}`);
    console.log(`  Último premio: ${lastPrize.draw_datetime.toISOString()}`);

    console.log('\n✅ Carga completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

loadPepsicoStock();
