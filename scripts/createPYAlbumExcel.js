const XLSX = require('xlsx');
const path = require('path');

// Stock data for Paraguay (PY) album
// Based on stock image: 9 Coolers + Digital combos
const PY_STICKERS = [
  // ============================================
  // PREMIO: 184,000 puntos (10 combos)
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_184000_1', STICKER_NAME: 'Michelob 184000 pts Game 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/184000.png',
    PRIZE_POINTS: 184000, BRAND: 'mu', IS_PRIZE: true, STOCK: 10 },

  // ============================================
  // PREMIO: 140,030 puntos (25 combos)
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_140030_1', STICKER_NAME: 'Michelob 140030 pts Game 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/140000.png',
    PRIZE_POINTS: 140030, BRAND: 'mu', IS_PRIZE: true, STOCK: 25 },

  // ============================================
  // PREMIO: 81,470 puntos (35 combos)
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_81470_1', STICKER_NAME: 'Michelob 81470 pts Game 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/81000.png',
    PRIZE_POINTS: 81470, BRAND: 'mu', IS_PRIZE: true, STOCK: 35 },

  // ============================================
  // PREMIO: 7,360 puntos (100 combos)
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_7360_1', STICKER_NAME: 'Michelob 7360 pts Game 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/7000.png',
    PRIZE_POINTS: 7360, BRAND: 'mu', IS_PRIZE: true, STOCK: 100 },

  // ============================================
  // PREMIO: 2,000 puntos (450 combos)
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_2000_1', STICKER_NAME: 'Michelob 2000 pts Game 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/2000.png',
    PRIZE_POINTS: 2000, BRAND: 'mu', IS_PRIZE: true, STOCK: 450 },

  // ============================================
  // PREMIO: 200 puntos (1,500 combos)
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_200_1', STICKER_NAME: 'Michelob 200 pts Game 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/200.png',
    PRIZE_POINTS: 200, BRAND: 'mu', IS_PRIZE: true, STOCK: 1500 },

  // ============================================
  // PREMIO FÍSICO: Cooler (9 unidades)
  // PRIZE_POINTS: 999999 para identificar como premio físico
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_cooler_1', STICKER_NAME: 'Cooler Prize',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/Cooler.jpeg',
    PRIZE_POINTS: 999999, BRAND: 'other', IS_PRIZE: true, STOCK: 9 },

  // ============================================
  // SIN PREMIO (Non-Prize Stickers)
  // ============================================
  { ALBUM_ID: 'PY', STICKER_ID: 'py_noprize_1', STICKER_NAME: 'Michelob No Prize 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/Sin%20Premio%201.jpeg',
    PRIZE_POINTS: 0, BRAND: 'mu', IS_PRIZE: false, STOCK: 999999 },

  { ALBUM_ID: 'PY', STICKER_ID: 'py_noprize_2', STICKER_NAME: 'Michelob No Prize 2',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/PY/Sin%20Premio%203.jpeg',
    PRIZE_POINTS: 0, BRAND: 'mu', IS_PRIZE: false, STOCK: 999999 }
];

// Create Excel workbook
const workbook = XLSX.utils.book_new();

// Convert stickers array to worksheet
const worksheet = XLSX.utils.json_to_sheet(PY_STICKERS);

// Set column widths for better readability
worksheet['!cols'] = [
  { wch: 10 },  // ALBUM_ID
  { wch: 20 },  // STICKER_ID
  { wch: 35 },  // STICKER_NAME
  { wch: 100 }, // STICKER_URL
  { wch: 15 },  // PRIZE_POINTS
  { wch: 10 },  // BRAND
  { wch: 10 },  // IS_PRIZE
  { wch: 10 }   // STOCK
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'PY_Stock');

// Generate output path
const outputPath = path.join(__dirname, '..', 'Files', 'AlbumStockPY.xlsx');

// Write file
XLSX.writeFile(workbook, outputPath);

console.log('✅ Excel file created successfully at:', outputPath);
console.log('\n📊 Paraguay Album Stock Summary:');
console.log('   Total Prize Stickers: 7 types');
console.log('   Total Non-Prize Stickers: 2 types');
console.log('   Total Prizes Available: 2,129 (including 9 Coolers)');
console.log('\n📈 Prize Distribution:');
console.log('   - 184,000 pts: 10 combos');
console.log('   - 140,030 pts: 25 combos');
console.log('   - 81,470 pts: 35 combos');
console.log('   - 7,360 pts: 100 combos');
console.log('   - 2,000 pts: 450 combos');
console.log('   - 200 pts: 1,500 combos');
console.log('   - Coolers: 9 units');
console.log('\n💾 Next step: Load to MongoDB with:');
console.log('   node scripts/loadAlbumStockV2.js PY');
