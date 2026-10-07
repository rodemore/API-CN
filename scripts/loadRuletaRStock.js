require('dotenv').config();
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');

const loadRuletaRStock = async () => {
  try {
    // Conectar a MongoDB usando la variable de entorno
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    const workbook = xlsx.readFile('./Files/PremiosRuletaR.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Leyendo ${data.length} premios de RuletaR del Excel...`);

    // Limpiar los premios de RuletaR existentes (ID_RULETA: 3)
    await Stock.deleteMany({ ID_RULETA: 3 });
    console.log('🗑️  Premios de RuletaR anteriores eliminados');

    // Insertar los datos
    for (const item of data) {
      const premio = await Stock.create(item);
      console.log(`✅ Premio ${premio.ID_PREMIO} - ${premio.PREMIO} cargado (Stock: ${premio.Stock})`);
    }

    console.log('🎉 Stock de RuletaR cargado exitosamente!');

    // Verificar el stock cargado
    const count = await Stock.countDocuments({ ID_RULETA: 3 });
    console.log(`📦 Total de premios de RuletaR en la base de datos: ${count}`);

    // Mostrar resumen
    const premios = await Stock.find({ ID_RULETA: 3 }).sort({ ID_PREMIO: 1 });
    console.log('\n📋 Resumen de premios:');
    premios.forEach(p => {
      console.log(`   ${p.PREMIO}: ${p.Stock} disponibles`);
    });

  } catch (error) {
    console.error('❌ Error cargando el stock de RuletaR:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

loadRuletaRStock();
