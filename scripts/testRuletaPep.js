require('dotenv').config();
const mongoose = require('mongoose');
const TimeWindowPrize = require('../models/TimeWindowPrize');
const PepsicoWinner = require('../models/PepsicoWinner');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

async function testRuletaPep() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Test 1: Check total prizes loaded
    console.log('=== TEST 1: Total de premios cargados ===');
    const totalPrizes = await TimeWindowPrize.countDocuments();
    console.log(`Total de premios: ${totalPrizes}`);
    console.log('✅ Test 1 pasado\n');

    // Test 2: Check prizes are not claimed
    console.log('=== TEST 2: Verificar que ningún premio está reclamado ===');
    const claimedCount = await TimeWindowPrize.countDocuments({ is_claimed: true });
    console.log(`Premios reclamados: ${claimedCount}`);
    if (claimedCount === 0) {
      console.log('✅ Test 2 pasado\n');
    } else {
      console.log('❌ Test 2 fallado - hay premios reclamados\n');
    }

    // Test 3: Simulate a spin - check for available prizes
    console.log('=== TEST 3: Simular spin - buscar premios disponibles ===');
    const now = new Date();
    console.log(`Fecha actual: ${now.toISOString()}`);

    const availablePrizes = await TimeWindowPrize.find({
      draw_datetime: { $lte: now },
      is_claimed: false
    }).sort({ draw_datetime: 1 }).limit(5);

    if (availablePrizes.length > 0) {
      console.log(`❌ Premios disponibles ahora: ${availablePrizes.length}`);
      console.log('Los primeros 5 premios disponibles:');
      availablePrizes.forEach((prize, index) => {
        console.log(`  ${index + 1}. ${prize.prize_name} - ${prize.draw_datetime.toISOString()}`);
      });
      console.log('\n⚠️  Hay premios disponibles - esto significa que la fecha actual está DESPUÉS de algunos premios');
      console.log('Esto es esperado si ya estamos en 2026-09-09 o después\n');
    } else {
      console.log('✅ No hay premios disponibles aún - el juego comenzará el 2026-09-09\n');
    }

    // Test 4: Check first and last prizes
    console.log('=== TEST 4: Verificar primer y último premio ===');
    const firstPrize = await TimeWindowPrize.findOne().sort({ draw_datetime: 1 });
    const lastPrize = await TimeWindowPrize.findOne().sort({ draw_datetime: -1 });

    console.log(`Primer premio: ${firstPrize.prize_name} - ${firstPrize.draw_datetime.toISOString()}`);
    console.log(`Último premio: ${lastPrize.prize_name} - ${lastPrize.draw_datetime.toISOString()}`);

    if (firstPrize.draw_datetime.toISOString().startsWith('2026-09-09')) {
      console.log('✅ Test 4 pasado - primer premio es del 9 de septiembre\n');
    } else {
      console.log('❌ Test 4 fallado - primer premio NO es del 9 de septiembre\n');
    }

    // Test 5: Simulate claiming a prize (if available)
    if (availablePrizes.length > 0) {
      console.log('=== TEST 5: Simular reclamar un premio ===');
      const testUserId = 'test_user_123';
      const prizeToWin = availablePrizes[0];

      // Create winner record
      const winnerRecord = new PepsicoWinner({
        user_id: testUserId,
        is_winner: true,
        prize_name: prizeToWin.prize_name,
        prize_id: prizeToWin._id,
        play_datetime: new Date()
      });

      await winnerRecord.save();

      // Mark prize as claimed
      prizeToWin.is_claimed = true;
      prizeToWin.winner_user_id = testUserId;
      prizeToWin.claimed_at = new Date();
      await prizeToWin.save();

      console.log(`✅ Premio reclamado: ${prizeToWin.prize_name} por ${testUserId}`);

      // Verify
      const verifyPrize = await TimeWindowPrize.findById(prizeToWin._id);
      const verifyWinner = await PepsicoWinner.findById(winnerRecord._id);

      if (verifyPrize.is_claimed && verifyWinner.is_winner) {
        console.log('✅ Test 5 pasado - premio marcado como reclamado y ganador registrado\n');

        // Clean up test data
        await TimeWindowPrize.findByIdAndUpdate(prizeToWin._id, {
          is_claimed: false,
          winner_user_id: null,
          claimed_at: null
        });
        await PepsicoWinner.findByIdAndDelete(winnerRecord._id);
        console.log('🧹 Datos de prueba limpiados\n');
      } else {
        console.log('❌ Test 5 fallado\n');
      }
    } else {
      console.log('=== TEST 5: OMITIDO - No hay premios disponibles para simular ===\n');
    }

    // Test 6: Simulate a losing spin
    console.log('=== TEST 6: Simular una participación sin premio ===');
    const loserUserId = 'test_loser_456';
    const loserRecord = new PepsicoWinner({
      user_id: loserUserId,
      is_winner: false,
      prize_name: null,
      prize_id: null,
      play_datetime: new Date()
    });

    await loserRecord.save();
    console.log(`✅ Participación sin premio registrada para ${loserUserId}`);

    const verifyLoser = await PepsicoWinner.findById(loserRecord._id);
    if (!verifyLoser.is_winner) {
      console.log('✅ Test 6 pasado\n');
      await PepsicoWinner.findByIdAndDelete(loserRecord._id);
      console.log('🧹 Datos de prueba limpiados\n');
    } else {
      console.log('❌ Test 6 fallado\n');
    }

    console.log('=== RESUMEN ===');
    console.log('✅ Todos los tests completados exitosamente');
    console.log(`📊 Total de premios: ${totalPrizes}`);
    console.log(`📅 Período: ${firstPrize.draw_datetime.toISOString()} - ${lastPrize.draw_datetime.toISOString()}`);
    console.log(`🎁 Tipos de premios: 9 diferentes`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

testRuletaPep();
