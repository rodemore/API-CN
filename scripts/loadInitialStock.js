const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const config = require('../config.json');

const loadInitialStock = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    const workbook = xlsx.readFile('./Files/Premios.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Leyendo ${data.length} premios del Excel...`);

    // Limpiar la colección existente
    await Stock.deleteMany({});
    console.log('🗑️  Colección limpiada');

    // Insertar los datos
    for (const item of data) {
      await Stock.findOneAndUpdate(
        { ID_PREMIO: item.ID_PREMIO },
        item,
        { upsert: true, new: true }
      );
      console.log(`✅ Premio ${item.ID_PREMIO} - ${item.PREMIO} cargado`);
    }

    console.log('🎉 Stock inicial cargado exitosamente!');

    // Verificar el stock cargado
    const count = await Stock.countDocuments();
    console.log(`📦 Total de premios en la base de datos: ${count}`);

  } catch (error) {
    console.error('❌ Error cargando el stock inicial:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

loadInitialStock();
