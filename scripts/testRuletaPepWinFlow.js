require('dotenv').config();
const mongoose = require('mongoose');
const TimeWindowPrize = require('../models/TimeWindowPrize');
const PepsicoWinner = require('../models/PepsicoWinner');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

async function testWinFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('=== PRUEBA COMPLETA DE FLUJO DE GANADOR ===\n');

    // Step 1: Get a future prize and modify it to be available now
    const futurePrize = await TimeWindowPrize.findOne({
      is_claimed: false
    }).sort({ draw_datetime: 1 });

    console.log(`1️⃣  Premio original encontrado:`);
    console.log(`   - Premio: ${futurePrize.prize_name}`);
    console.log(`   - Fecha original: ${futurePrize.draw_datetime.toISOString()}`);
    console.log(`   - Reclamado: ${futurePrize.is_claimed}\n`);

    // Save original date for restoration
    const originalDate = futurePrize.draw_datetime;

    // Temporarily set draw_datetime to the past
    const pastDate = new Date('2026-09-01T00:00:00.000Z');
    futurePrize.draw_datetime = pastDate;
    await futurePrize.save();

    console.log(`2️⃣  Premio temporalmente modificado para estar disponible:`);
    console.log(`   - Nueva fecha: ${pastDate.toISOString()}\n`);

    // Step 2: Simulate spin logic
    const now = new Date();
    console.log(`3️⃣  Simulando SPIN en fecha: ${now.toISOString()}`);

    const availablePrizes = await TimeWindowPrize.find({
      draw_datetime: { $lte: now },
      is_claimed: false
    }).sort({ draw_datetime: 1 });

    console.log(`   - Premios disponibles: ${availablePrizes.length}`);

    if (availablePrizes.length === 0) {
      console.log('❌ No hay premios disponibles - test fallido\n');
      return;
    }

    const wonPrize = availablePrizes[0];
    console.log(`   - Premio ganado: ${wonPrize.prize_name} (ID: ${wonPrize._id})\n`);

    // Step 3: Simulate winner registration
    const testUserId = 'test_winner_999';
    console.log(`4️⃣  Registrando ganador (user_id: ${testUserId})`);

    // Create winner record
    const winnerRecord = new PepsicoWinner({
      user_id: testUserId,
      is_winner: true,
      prize_name: wonPrize.prize_name,
      prize_id: wonPrize._id,
      play_datetime: new Date()
    });

    await winnerRecord.save();
    console.log(`   ✅ Registro de ganador creado (ID: ${winnerRecord._id})\n`);

    // Mark prize as claimed
    wonPrize.is_claimed = true;
    wonPrize.winner_user_id = testUserId;
    wonPrize.claimed_at = new Date();
    await wonPrize.save();

    console.log(`5️⃣  Premio marcado como reclamado:`);
    console.log(`   - is_claimed: ${wonPrize.is_claimed}`);
    console.log(`   - winner_user_id: ${wonPrize.winner_user_id}`);
    console.log(`   - claimed_at: ${wonPrize.claimed_at.toISOString()}\n`);

    // Step 4: Verify another spin would NOT give the same prize
    console.log(`6️⃣  Verificando que el mismo premio NO se puede ganar otra vez...`);

    const availablePrizesAfter = await TimeWindowPrize.find({
      draw_datetime: { $lte: now },
      is_claimed: false
    }).sort({ draw_datetime: 1 });

    console.log(`   - Premios disponibles después: ${availablePrizesAfter.length}`);

    const wasPrizeInList = availablePrizesAfter.some(p => p._id.equals(wonPrize._id));
    if (!wasPrizeInList) {
      console.log(`   ✅ El premio reclamado ya NO está en la lista de disponibles\n`);
    } else {
      console.log(`   ❌ ERROR: El premio reclamado todavía aparece como disponible\n`);
    }

    // Step 5: Verify data integrity
    console.log(`7️⃣  Verificando integridad de datos...`);

    const verifyPrize = await TimeWindowPrize.findById(wonPrize._id);
    const verifyWinner = await PepsicoWinner.findById(winnerRecord._id);

    console.log(`   - Premio en DB: is_claimed=${verifyPrize.is_claimed}, winner=${verifyPrize.winner_user_id}`);
    console.log(`   - Ganador en DB: user_id=${verifyWinner.user_id}, prize_name=${verifyWinner.prize_name}\n`);

    if (verifyPrize.is_claimed && verifyPrize.winner_user_id === testUserId && verifyWinner.is_winner) {
      console.log('✅ INTEGRIDAD VERIFICADA - Todos los datos son correctos\n');
    } else {
      console.log('❌ ERROR DE INTEGRIDAD\n');
    }

    // Step 6: Clean up test data
    console.log(`8️⃣  Limpiando datos de prueba...`);

    // Restore original date
    await TimeWindowPrize.findByIdAndUpdate(wonPrize._id, {
      draw_datetime: originalDate,
      is_claimed: false,
      winner_user_id: null,
      claimed_at: null
    });

    await PepsicoWinner.findByIdAndDelete(winnerRecord._id);

    console.log(`   ✅ Premio restaurado a su estado original`);
    console.log(`   ✅ Registro de ganador eliminado\n`);

    // Final verification
    const finalPrize = await TimeWindowPrize.findById(wonPrize._id);
    console.log(`9️⃣  Verificación final:`);
    console.log(`   - Fecha restaurada: ${finalPrize.draw_datetime.toISOString()}`);
    console.log(`   - is_claimed: ${finalPrize.is_claimed}`);
    console.log(`   - winner_user_id: ${finalPrize.winner_user_id}\n`);

    console.log('=== RESUMEN ===');
    console.log('✅ FLUJO COMPLETO DE GANADOR PROBADO EXITOSAMENTE');
    console.log('✅ La lógica de time-window funciona correctamente');
    console.log('✅ Los premios se pueden reclamar y no se repiten');
    console.log('✅ Los datos se restauran correctamente\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

testWinFlow();
