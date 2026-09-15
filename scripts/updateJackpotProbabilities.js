require('dotenv').config();
const mongoose = require('mongoose');
const JackpotStock = require('../models/JackpotStock');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

// New probabilities (doubled)
const newProbabilities = [
  { ID_PREMIO: 1, PROBABILIDAD: 65 },      // was 32.5
  { ID_PREMIO: 2, PROBABILIDAD: 0.8 },     // was 0.4
  { ID_PREMIO: 3, PROBABILIDAD: 0.4 },     // was 0.2
  { ID_PREMIO: 4, PROBABILIDAD: 0.2 },     // was 0.1
  { ID_PREMIO: 5, PROBABILIDAD: 0.02 },    // was 0.01
  { ID_PREMIO: 6, PROBABILIDAD: 0.01 }     // was 0.005
];

async function updateJackpotProbabilities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Probabilidades actuales:');
    const currentPrizes = await JackpotStock.find().sort({ ID_PREMIO: 1 });
    currentPrizes.forEach(prize => {
      console.log(`  Premio ${prize.ID_PREMIO} (${prize.PUNTOS} puntos): ${prize.PROBABILIDAD}% (Stock: ${prize.Stock - prize.GANADORES}/${prize.Stock})`);
    });

    console.log('\n🔄 Actualizando probabilidades...');

    // Update each prize probability
    for (const update of newProbabilities) {
      await JackpotStock.updateOne(
        { ID_PREMIO: update.ID_PREMIO },
        { $set: { PROBABILIDAD: update.PROBABILIDAD } }
      );
      console.log(`  ✅ Premio ${update.ID_PREMIO}: ${update.PROBABILIDAD}%`);
    }

    console.log('\n📈 Probabilidades actualizadas:');
    const updatedPrizes = await JackpotStock.find().sort({ ID_PREMIO: 1 });
    let totalProbability = 0;
    updatedPrizes.forEach(prize => {
      totalProbability += prize.PROBABILIDAD;
      console.log(`  Premio ${prize.ID_PREMIO} (${prize.PUNTOS} puntos): ${prize.PROBABILIDAD}% (Stock: ${prize.Stock - prize.GANADORES}/${prize.Stock})`);
    });

    console.log('\n📊 Resumen:');
    console.log(`  Probabilidad total de ganar: ${totalProbability}%`);
    console.log(`  Probabilidad de NO ganar: ${(100 - totalProbability).toFixed(4)}%`);
    console.log(`  Total de ganadores hasta ahora: ${updatedPrizes.reduce((sum, p) => sum + p.GANADORES, 0)}`);

    console.log('\n✅ Actualización completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

updateJackpotProbabilities();
