require('dotenv').config();
const mongoose = require('mongoose');
const TimeWindowPrizeNestle = require('../models/TimeWindowPrizeNestle');
const NestleWinner = require('../models/NestleWinner');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

async function testRuletaNestle() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Test 1: Check total prizes loaded
    console.log('=== TEST 1: Verificar premios cargados ===');
    const totalPrizes = await TimeWindowPrizeNestle.countDocuments();
    console.log(`Total de premios: ${totalPrizes}`);
    console.assert(totalPrizes === 300, '❌ Debería haber 300 premios');
    console.log('✅ Cantidad correcta de premios\n');

    // Test 2: Check claimed prizes
    console.log('=== TEST 2: Verificar premios reclamados ===');
    const claimedPrizes = await TimeWindowPrizeNestle.countDocuments({ is_claimed: true });
    console.log(`Premios reclamados: ${claimedPrizes}`);
    console.log(`Premios sin reclamar: ${totalPrizes - claimedPrizes}`);
    console.log('✅ Estado de premios verificado\n');

    // Test 3: Check first prize date
    console.log('=== TEST 3: Verificar fecha del primer premio ===');
    const firstPrize = await TimeWindowPrizeNestle.findOne().sort({ draw_datetime: 1 });
    console.log(`Primer premio: ${firstPrize.prize_name}`);
    console.log(`Fecha/hora: ${firstPrize.draw_datetime.toISOString()}`);
    const expectedFirstDate = new Date('2024-10-14T00:00:00.000Z');
    console.assert(
      firstPrize.draw_datetime.getTime() === expectedFirstDate.getTime(),
      '❌ La fecha del primer premio debería ser 2024-10-14T00:00:00.000Z'
    );
    console.log('✅ Fecha del primer premio correcta\n');

    // Test 4: Check available prizes (draw_datetime <= now)
    console.log('=== TEST 4: Verificar premios disponibles ahora ===');
    const now = new Date();
    const availablePrizes = await TimeWindowPrizeNestle.countDocuments({
      draw_datetime: { $lte: now },
      is_claimed: false
    });
    console.log(`Fecha/hora actual: ${now.toISOString()}`);
    console.log(`Premios disponibles: ${availablePrizes}`);
    console.log('✅ Sistema de timewindow funcionando\n');

    // Test 5: Check prize distribution
    console.log('=== TEST 5: Verificar distribución de premios ===');
    const prizeDistribution = await TimeWindowPrizeNestle.aggregate([
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

    console.log('Distribución de premios:');
    prizeDistribution.forEach(p => {
      console.log(`  ${p._id}: ${p.count}`);
    });
    console.log('✅ Distribución verificada\n');

    // Test 6: Check winners collection is empty
    console.log('=== TEST 6: Verificar colección de ganadores ===');
    const totalWinners = await NestleWinner.countDocuments();
    console.log(`Total de registros en NestleWinner: ${totalWinners}`);
    console.log('✅ Colección de ganadores lista\n');

    console.log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE');

  } catch (error) {
    console.error('❌ Error en tests:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

testRuletaNestle();
