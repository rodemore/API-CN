const XLSX = require('xlsx');
const path = require('path');

// Argentina Album Stock Data - Quilmes (QUI)
// Stock compartido con MUL: 65,000 premios totales
// Los premios ya existen en la DB, solo agregamos los stickers de Quilmes

const quilmesStickers = [
  // ===== QUILMES (QUI) - PREMIO STICKERS =====
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_qui_20000',
    STICKER_NAME: 'Quilmes 20,000 pts',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/Quilmes/QUILMES_20000.jpg',
    PRIZE_POINTS: 20000,
    BRAND: 'QUI',
    IS_PRIZE: true,
    STOCK: 10000 // Stock compartido con MUL
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_qui_10000',
    STICKER_NAME: 'Quilmes 10,000 pts',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/Quilmes/QUILMES_10000.jpg',
    PRIZE_POINTS: 10000,
    BRAND: 'QUI',
    IS_PRIZE: true,
    STOCK: 20000 // Stock compartido con MUL
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_qui_5000',
    STICKER_NAME: 'Quilmes 5,000 pts',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/Quilmes/QUILMES_5000.jpg',
    PRIZE_POINTS: 5000,
    BRAND: 'QUI',
    IS_PRIZE: true,
    STOCK: 35000 // Stock compartido con MUL
  },

  // ===== QUILMES (QUI) - NO PRIZE STICKERS =====
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_qui_noprize_1',
    STICKER_NAME: 'Quilmes No Prize 1',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/Quilmes/Figurita+Quilmes+(1+-+sin+puntos).jpg',
    PRIZE_POINTS: 0,
    BRAND: 'QUI',
    IS_PRIZE: false,
    STOCK: 999999
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_qui_noprize_2',
    STICKER_NAME: 'Quilmes No Prize 2',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/Quilmes/Figurita+Quilmes+(2+-+sin+puntos).jpg',
    PRIZE_POINTS: 0,
    BRAND: 'QUI',
    IS_PRIZE: false,
    STOCK: 999999
  },
  {
    ALBUM_ID: 'ARG',
    STICKER_ID: 'arg_qui_noprize_3',
    STICKER_NAME: 'Quilmes No Prize 3',
    STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/AR/Quilmes/Figurita+Quilmes+(3+-+sin+puntos).jpg',
    PRIZE_POINTS: 0,
    BRAND: 'QUI',
    IS_PRIZE: false,
    STOCK: 999999
  }
];

// Read existing ARG stock and add Quilmes stickers
const existingPath = path.join(__dirname, '..', 'Files', 'PremiosARG.xlsx');
const workbook = XLSX.readFile(existingPath);
const sheetName = workbook.SheetNames[0];
const existingData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Combine MUL and QUI stickers
const allStickers = [...existingData, ...quilmesStickers];

// Create new workbook with both brands
const ws = XLSX.utils.json_to_sheet(allStickers);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'ARG Album Stock');

// Save to Files directory
const outputPath = path.join(__dirname, '..', 'Files', 'PremiosARG.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Quilmes stickers added to Argentina Album Excel!');
console.log(`📁 File saved to: ${outputPath}`);
console.log('\n📊 Stock Summary (MUL + QUI):');
console.log('   - Total Prize Stickers (MUL): 3');
console.log('   - Total No-Prize Stickers (MUL): 3');
console.log('   - Total Prize Stickers (QUI): 3');
console.log('   - Total No-Prize Stickers (QUI): 3');
console.log('   - Total Stickers: 12');
console.log('\n   Prize Stock (Shared):');
console.log('   - 20,000 pts: 10,000 premios');
console.log('   - 10,000 pts: 20,000 premios');
console.log('   - 5,000 pts: 35,000 premios');
console.log('   - Total Premios: 65,000 (compartido entre MUL y QUI)');
console.log('\n🚀 Next step: Load to MongoDB with "npm run load-arg-all"');
