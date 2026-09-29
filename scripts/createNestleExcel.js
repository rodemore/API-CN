const XLSX = require('xlsx');
const path = require('path');

// Generate Nestle timewindow prizes - 300 premios
function generateNestlePrizes() {
  const data = [
    // Header row
    ['#', 'Premio', 'draw_datetime']
  ];

  // Prize distribution - TOTAL: 300 premios
  const prizes = {
    '100 Puntos': 150,
    '250 Puntos': 100,
    '500 Puntos': 40,
    '1000 Puntos': 10
  };

  // Start date: October 14, 2024
  const startDate = new Date('2024-10-14T00:00:00.000Z');
  // End date: December 14, 2024
  const endDate = new Date('2024-12-14T23:59:59.000Z');

  // Calculate total prizes
  const totalPrizes = Object.values(prizes).reduce((a, b) => a + b, 0);
  console.log(`Generando ${totalPrizes} premios...`);

  // Calculate time interval between prizes in milliseconds
  const totalTimeMs = endDate - startDate;
  const intervalMs = totalTimeMs / totalPrizes;

  let currentIndex = 1;
  let currentDate = new Date(startDate);

  // Create array of all prizes
  const allPrizes = [];
  for (const [prizeName, count] of Object.entries(prizes)) {
    for (let i = 0; i < count; i++) {
      allPrizes.push(prizeName);
    }
  }

  // Shuffle prizes for random distribution
  for (let i = allPrizes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPrizes[i], allPrizes[j]] = [allPrizes[j], allPrizes[i]];
  }

  // Generate prizes with timewindows
  allPrizes.forEach((prizeName) => {
    data.push([
      currentIndex,
      prizeName,
      currentDate.toISOString()
    ]);

    currentIndex++;
    currentDate = new Date(currentDate.getTime() + intervalMs);
  });

  return data;
}

function createNestleExcel() {
  try {
    console.log('📝 Creando archivo Excel de Nestle...');

    // Generate prize data
    const data = generateNestlePrizes();

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // Column A: #
      { wch: 25 },  // Column B: Premio
      { wch: 25 }   // Column C: draw_datetime
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Premios Nestle');

    // Write file
    const filePath = path.join(__dirname, '..', 'Files', 'TimeWindow-Nestle.xlsx');
    XLSX.writeFile(workbook, filePath);

    console.log('✅ Archivo creado exitosamente en:', filePath);
    console.log('\n📊 Distribución de premios:');
    console.log('   - 100 Puntos: 150');
    console.log('   - 250 Puntos: 100');
    console.log('   - 500 Puntos: 40');
    console.log('   - 1000 Puntos: 10');
    console.log(`\n📈 Total de premios: ${data.length - 1}`);
    console.log('📅 Período: 14 de octubre - 14 de diciembre 2024');
    console.log('\n✅ Sistema listo para cargar a la base de datos');

  } catch (error) {
    console.error('❌ Error creando archivo Excel:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createNestleExcel();
