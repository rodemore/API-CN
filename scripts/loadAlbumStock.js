require('dotenv').config();
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');

const loadAlbumStock = async () => {
  try {
    // Conectar a MongoDB usando la variable de entorno
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Leer el archivo Excel
    const workbook = xlsx.readFile('./Files/simulacionAlbum.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Leyendo ${data.length} premios de álbum del Excel...`);

    // Filtrar filas válidas (que tengan ID_PREMIO)
    const validData = data.filter(item => item.ID_PREMIO);

    console.log(`📊 Premios válidos: ${validData.length}`);

    // Limpiar los premios de álbum existentes (ID_RULETA: 3)
    await Stock.deleteMany({ ID_RULETA: 3 });
    console.log('🗑️  Premios de álbum anteriores eliminados');

    // Ajustar ID_RULETA a 3 para el juego de álbum
    const albumData = validData.map(item => ({
      ...item,
      ID_RULETA: 3,
      RULETA: 'Álbum'
    }));

    // Insertar los datos
    for (const item of albumData) {
      const premio = await Stock.create(item);
      console.log(`✅ Premio ${premio.ID_PREMIO} - ${premio.PREMIO} cargado (Stock: ${premio.Stock})`);
    }

    console.log('🎉 Stock de álbum cargado exitosamente!');

    // Verificar el stock cargado
    const count = await Stock.countDocuments({ ID_RULETA: 3 });
    console.log(`📦 Total de premios de álbum en la base de datos: ${count}`);

    // Mostrar resumen
    const premios = await Stock.find({ ID_RULETA: 3 }).sort({ ID_PREMIO: 1 });
    console.log('\n📋 Resumen de premios:');
    premios.forEach(p => {
      console.log(`   ${p.PREMIO}: ${p.Stock} disponibles`);
    });

  } catch (error) {
    console.error('❌ Error cargando el stock de álbum:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

loadAlbumStock();
