const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Stock = require('../models/Stock');
const config = require('../config.json');

async function updatePremios() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    console.log('📖 Leyendo archivo Excel...');
    const filePath = path.join(__dirname, '../Files/Premios.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Primera hoja
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📊 Se encontraron ${data.length} registros en el Excel`);

    // Borrar todos los datos existentes
    console.log('🗑️  Borrando datos existentes...');
    const deleteResult = await Stock.deleteMany({});
    console.log(`✅ Se eliminaron ${deleteResult.deletedCount} registros`);

    // Transformar los datos al formato del modelo
    const premiosData = data.map(item => ({
      ID_PREMIO: item.ID_PREMIO,
      PREMIO: item.PREMIO,
      Stock: item.Stock,
      GANADORES: item.GANADORES || 0,
      ID_RULETA: item.ID_RULETA || 1,
      RULETA: item.RULETA
    }));

    // Insertar los nuevos datos
    console.log('💾 Insertando nuevos datos...');
    const result = await Stock.insertMany(premiosData);
    console.log(`✅ Se insertaron ${result.length} registros exitosamente`);

    // Mostrar resumen
    console.log('\n📋 Resumen de premios actualizados:');
    const premios = await Stock.find().sort({ ID_PREMIO: 1 });
    premios.forEach(premio => {
      console.log(`  • ID: ${premio.ID_PREMIO} - ${premio.PREMIO} (Stock: ${premio.Stock})`);
    });

    console.log('\n🎉 Actualización completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error.message);
    console.error(error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
updatePremios();
