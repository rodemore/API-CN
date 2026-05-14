require('dotenv').config();
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');

const loadMilexStock = async () => {
  try {
    // Conectar a MongoDB usando la variable de entorno
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    const workbook = xlsx.readFile('./Files/ruletaMilex.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Leyendo ${data.length} premios de Milex del Excel...`);

    // Limpiar los premios de Milex existentes (ID_RULETA: 6)
    await Stock.deleteMany({ ID_RULETA: 6 });
    console.log('🗑️  Premios de Milex anteriores eliminados');

    // Corregir ID_PREMIO duplicado (el segundo 203 debe ser 204)
    let correctedCount = 0;
    const correctedData = data.map((item, index) => {
      // Si encontramos el segundo registro con ID_PREMIO 203 (2000 puntos), cambiarlo a 204
      if (item.ID_PREMIO === 203 && item.PREMIO === '2000 puntos') {
        correctedCount++;
        return { ...item, ID_PREMIO: 204 };
      }
      return item;
    });

    if (correctedCount > 0) {
      console.log(`⚠️  ${correctedCount} ID_PREMIO duplicado corregido`);
    }

    // Insertar los datos
    for (const item of correctedData) {
      const premio = await Stock.create(item);
      console.log(`✅ Premio ${premio.ID_PREMIO} - ${premio.PREMIO} cargado (Stock: ${premio.Stock})`);
    }

    console.log('🎉 Stock de Milex cargado exitosamente!');

    // Verificar el stock cargado
    const count = await Stock.countDocuments({ ID_RULETA: 6 });
    console.log(`📦 Total de premios de Milex en la base de datos: ${count}`);

    // Mostrar resumen
    const premios = await Stock.find({ ID_RULETA: 6 }).sort({ ID_PREMIO: 1 });
    console.log('\n📋 Resumen de premios Milex:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    premios.forEach(p => {
      console.log(`   ID ${p.ID_PREMIO}: ${p.PREMIO.padEnd(20)} - ${p.Stock} disponibles`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalStock = premios.reduce((sum, p) => sum + p.Stock, 0);
    console.log(`   📊 Stock total: ${totalStock} premios`);

  } catch (error) {
    console.error('❌ Error cargando el stock de Milex:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

loadMilexStock();
