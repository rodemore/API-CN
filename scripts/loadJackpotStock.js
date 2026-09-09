require('dotenv').config();
const mongoose = require('mongoose');
const JackpotStock = require('../models/JackpotStock');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';

const jackpotPrizes = [
  { ID_PREMIO: 1, PUNTOS: 1000, Stock: 6500, PROBABILIDAD: 32.5 },
  { ID_PREMIO: 2, PUNTOS: 5000, Stock: 80, PROBABILIDAD: 0.4 },
  { ID_PREMIO: 3, PUNTOS: 10000, Stock: 40, PROBABILIDAD: 0.2 },
  { ID_PREMIO: 4, PUNTOS: 20000, Stock: 20, PROBABILIDAD: 0.1 },
  { ID_PREMIO: 5, PUNTOS: 50000, Stock: 2, PROBABILIDAD: 0.01 },
  { ID_PREMIO: 6, PUNTOS: 100000, Stock: 1, PROBABILIDAD: 0.005 }
];

async function loadJackpotStock() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Clear existing data
    await JackpotStock.deleteMany({});
    console.log('🗑️  Datos anteriores eliminados');

    // Insert prizes
    const result = await JackpotStock.insertMany(jackpotPrizes);
    console.log(`✅ ${result.length} premios de jackpot cargados exitosamente`);

    // Show statistics
    const totalStock = jackpotPrizes.reduce((sum, p) => sum + p.Stock, 0);
    const totalProbability = jackpotPrizes.reduce((sum, p) => sum + p.PROBABILIDAD, 0);

    console.log('\n📈 Estadísticas de Jackpot:');
    jackpotPrizes.forEach(prize => {
      console.log(`  ${prize.PUNTOS.toLocaleString()} puntos: ${prize.Stock} premios (${prize.PROBABILIDAD}% probabilidad)`);
    });

    console.log('\n📊 Resumen:');
    console.log(`  Total de premios: ${totalStock.toLocaleString()}`);
    console.log(`  Probabilidad total de ganar: ${totalProbability}%`);
    console.log(`  Probabilidad de NO ganar: ${(100 - totalProbability).toFixed(4)}%`);

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

loadJackpotStock();
