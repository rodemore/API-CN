const XLSX = require('xlsx');
const path = require('path');

// Argentina Album Stock Data - Michelob Ultra (MUL)
// Stock compartido entre MUL y QUI: 65,000 premios totales
// 5k pts: 35,000 | 10k pts: 20,000 | 20k pts: 10,000

const stockData = [
  // ===== MICHELOB ULTRA (MUL) - PREMIO STICKERS =====
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_mul_20000',
    STICKER_NAME: 'Michelob Ultra 20,000 pts',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/MUL/MUL_20000.jpg',
    PRIZE_POINTS: 20000,
    BRAND: 'MUL',
    IS_PRIZE: true,
    STOCK: 10000 // Total premio 20k compartido con QUI
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_mul_10000',
    STICKER_NAME: 'Michelob Ultra 10,000 pts',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/MUL/MUL_10000.jpg',
    PRIZE_POINTS: 10000,
    BRAND: 'MUL',
    IS_PRIZE: true,
    STOCK: 20000 // Total premio 10k compartido con QUI
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_mul_5000',
    STICKER_NAME: 'Michelob Ultra 5,000 pts',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/MUL/MUL_5000.jpg',
    PRIZE_POINTS: 5000,
    BRAND: 'MUL',
    IS_PRIZE: true,
    STOCK: 35000 // Total premio 5k compartido con QUI
  },

  // ===== MICHELOB ULTRA (MUL) - NO PRIZE STICKERS =====
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_mul_noprize_1',
    STICKER_NAME: 'Michelob Ultra No Prize 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/MUL/Figurita+MUL+(sin+puntos+-+1).jpg',
    PRIZE_POINTS: 0,
    BRAND: 'MUL',
    IS_PRIZE: false,
    STOCK: 999999
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_mul_noprize_2',
    STICKER_NAME: 'Michelob Ultra No Prize 2',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/MUL/Figurita+MUL+(sin+puntos+-+2).jpg',
    PRIZE_POINTS: 0,
    BRAND: 'MUL',
    IS_PRIZE: false,
    STOCK: 999999
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_mul_noprize_3',
    STICKER_NAME: 'Michelob Ultra No Prize 3',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/MUL/Figurita+MUL+(sin+puntos+-+3).jpg',
    PRIZE_POINTS: 0,
    BRAND: 'MUL',
    IS_PRIZE: false,
    STOCK: 999999
  }
];

// Create workbook and worksheet
const ws = XLSX.utils.json_to_sheet(stockData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'ARG Album Stock');

// Save to Files directory
const outputPath = path.join(__dirname, '..', 'Files', 'PremiosARG.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Argentina (ARG) - Michelob Ultra Album Excel created successfully!');
console.log(`📁 File saved to: ${outputPath}`);
console.log('\n📊 Stock Summary:');
console.log('   - Total Prize Stickers (MUL): 3');
console.log('   - Total No-Prize Stickers (MUL): 3');
console.log('   - 20,000 pts: 10,000 premios');
console.log('   - 10,000 pts: 20,000 premios');
console.log('   - 5,000 pts: 35,000 premios');
console.log('   - Total Premios: 65,000 (compartido con QUI)');
console.log('\n🚀 Next step: Load to MongoDB with "npm run load-arg"');
