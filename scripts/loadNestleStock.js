require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const TimeWindowPrizeNestle = require('../models/TimeWindowPrizeNestle');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

async function loadNestleStock() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Read Excel file
    const filePath = path.join(__dirname, '..', 'Files', 'TimeWindow-Nestle.xlsx');
    const workbook = XLSX.readFile(filePath);

    // Use first sheet
    const sheetName = workbook.SheetNames[0];
    console.log(`📄 Leyendo hoja: ${sheetName}`);

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`📊 Total de filas en Excel: ${data.length}`);

    // Skip header row and filter valid rows
    const rows = data.slice(1).filter(row => {
      // Must have prize name (column B, index 1) and draw_datetime (column C, index 2)
      return row[1] && row[2];
    });

    console.log(`📊 Filas válidas: ${rows.length}`);

    // Clear existing data
    await TimeWindowPrizeNestle.deleteMany({});
    console.log('🗑️  Datos anteriores eliminados');

    // Prepare prizes for bulk insert
    const prizes = rows.map(row => {
      const prizeName = row[1] ? row[1].trim() : '';
      const drawDatetime = new Date(row[2]);

      return {
        prize_name: prizeName,
        draw_datetime: drawDatetime,
        is_claimed: false,
        winner_user_id: null,
        claimed_at: null
      };
    });

    // Insert all prizes
    const result = await TimeWindowPrizeNestle.insertMany(prizes);
    console.log(`✅ ${result.length} premios cargados exitosamente`);

    // Show statistics
    const prizeStats = await TimeWindowPrizeNestle.aggregate([
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
    const firstPrize = await TimeWindowPrizeNestle.findOne().sort({ draw_datetime: 1 });
    const lastPrize = await TimeWindowPrizeNestle.findOne().sort({ draw_datetime: -1 });

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

loadNestleStock();
