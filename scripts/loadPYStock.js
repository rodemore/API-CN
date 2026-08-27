require('dotenv').config();
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');

const loadPYStock = async () => {
  try {
    // Conectar a MongoDB usando la variable de entorno
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    const workbook = xlsx.readFile('./Files/PremiosPY.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Leyendo ${data.length} premios de RuletaPY del Excel...`);

    // Limpiar los premios de RuletaPY existentes (ID_RULETA: 5)
    await Stock.deleteMany({ ID_RULETA: 5 });
    console.log('🗑️  Premios de RuletaPY anteriores eliminados');

    // Insertar los datos
    for (const item of data) {
      const premio = await Stock.create(item);
      console.log(`✅ Premio ${premio.ID_PREMIO} - ${premio.PREMIO} cargado (Stock: ${premio.Stock})`);
    }

    console.log('🎉 Stock de RuletaPY cargado exitosamente!');

    // Verificar el stock cargado
    const count = await Stock.countDocuments({ ID_RULETA: 5 });
    console.log(`📦 Total de premios de RuletaPY en la base de datos: ${count}`);

    // Mostrar resumen
    const premios = await Stock.find({ ID_RULETA: 5 }).sort({ ID_PREMIO: 1 });
    console.log('\n📋 Resumen de premios:');
    premios.forEach(p => {
      console.log(`   ${p.PREMIO}: ${p.Stock} disponibles`);
    });

    // Mostrar total de premios
    const totalStock = premios.reduce((sum, p) => sum + p.Stock, 0);
    console.log(`\n🎁 Total de premios: ${totalStock}`);

  } catch (error) {
    console.error('❌ Error cargando el stock de RuletaPY:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

loadPYStock();
