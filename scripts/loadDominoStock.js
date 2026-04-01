require('dotenv').config();
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');

const loadDominoStock = async () => {
  try {
    // Conectar a MongoDB usando la variable de entorno
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    const workbook = xlsx.readFile('./Files/PremiosDomino.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Leyendo ${data.length} premios de dominó del Excel...`);

    // Limpiar los premios de dominó existentes (ID_RULETA: 2)
    await Stock.deleteMany({ ID_RULETA: 2 });
    console.log('🗑️  Premios de dominó anteriores eliminados');

    // Insertar los datos
    for (const item of data) {
      const premio = await Stock.create(item);
      console.log(`✅ Premio ${premio.ID_PREMIO} - ${premio.PREMIO} cargado (Stock: ${premio.Stock})`);
    }

    console.log('🎉 Stock de dominó cargado exitosamente!');

    // Verificar el stock cargado
    const count = await Stock.countDocuments({ ID_RULETA: 2 });
    console.log(`📦 Total de premios de dominó en la base de datos: ${count}`);

    // Mostrar resumen
    const premios = await Stock.find({ ID_RULETA: 2 }).sort({ ID_PREMIO: 1 });
    console.log('\n📋 Resumen de premios:');
    premios.forEach(p => {
      console.log(`   ${p.PREMIO}: ${p.Stock} disponibles`);
    });

  } catch (error) {
    console.error('❌ Error cargando el stock de dominó:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

loadDominoStock();
