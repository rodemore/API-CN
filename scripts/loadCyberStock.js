require('dotenv').config();
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');

const loadCyberStock = async () => {
  try {
    // Conectar a MongoDB usando la variable de entorno
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    const workbook = xlsx.readFile('./Files/PremiosCyber.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Leyendo ${data.length} premios de Cyber del Excel...`);

    // Limpiar los premios de Cyber existentes (ID_RULETA: 3)
    await Stock.deleteMany({ ID_RULETA: 3 });
    console.log('🗑️  Premios de Cyber anteriores eliminados');

    // Insertar los datos
    for (const item of data) {
      const premio = await Stock.create(item);
      console.log(`✅ Premio ${premio.ID_PREMIO} - ${premio.PREMIO} cargado (Stock: ${premio.Stock})`);
    }

    console.log('🎉 Stock de Cyber cargado exitosamente!');

    // Verificar el stock cargado
    const count = await Stock.countDocuments({ ID_RULETA: 3 });
    console.log(`📦 Total de premios de Cyber en la base de datos: ${count}`);

    // Mostrar resumen
    const premios = await Stock.find({ ID_RULETA: 3 }).sort({ ID_PREMIO: 1 });
    console.log('\n📋 Resumen de premios:');
    premios.forEach(p => {
      console.log(`   ${p.PREMIO}: ${p.Stock} disponibles`);
    });

    // Mostrar probabilidad de ganar
    const totalStock = premios.reduce((sum, p) => sum + p.Stock, 0);
    const estimatedPlays = 250000;
    const winProbability = (totalStock / estimatedPlays * 100).toFixed(4);
    console.log(`\n🎯 Probabilidad de ganar: ${winProbability}% (${totalStock} premios / ${estimatedPlays} jugadas)`);

  } catch (error) {
    console.error('❌ Error cargando el stock de Cyber:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

loadCyberStock();
