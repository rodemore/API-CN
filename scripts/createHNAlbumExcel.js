const XLSX = require('xlsx');

// Basado en el HTML HN_album.html
const HN_STICKERS = [
  // PREMIO: 20000 puntos (2% probability)
  { ALBUM_ID: 'HN', STICKER_ID: 'sv1', STICKER_NAME: 'Salva Vida Game 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame1_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'sv', STOCK: 10 },
  { ALBUM_ID: 'HN', STICKER_ID: 'sv2', STICKER_NAME: 'Salva Vida Game 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame2_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'sv', STOCK: 10 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu1', STICKER_NAME: 'Michelob Ultra Game 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame1_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'mu', STOCK: 10 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu2', STICKER_NAME: 'Michelob Ultra Game 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame2_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'mu', STOCK: 10 },

  // PREMIO: 1000 puntos (23% probability)
  { ALBUM_ID: 'HN', STICKER_ID: 'sv3', STICKER_NAME: 'Salva Vida Game 3', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame3_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'sv', STOCK: 50 },
  { ALBUM_ID: 'HN', STICKER_ID: 'sv4', STICKER_NAME: 'Salva Vida Game 4', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame4_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'sv', STOCK: 50 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu3', STICKER_NAME: 'Michelob Ultra Game 3', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame3_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'mu', STOCK: 50 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu4', STICKER_NAME: 'Michelob Ultra Game 4', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame4_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'mu', STOCK: 50 },

  // PREMIO: 200 puntos (75% probability)
  { ALBUM_ID: 'HN', STICKER_ID: 'sv5', STICKER_NAME: 'Salva Vida Game 5', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame5_200+Points.png', PRIZE_POINTS: 200, BRAND: 'sv', STOCK: 150 },
  { ALBUM_ID: 'HN', STICKER_ID: 'sv6', STICKER_NAME: 'Salva Vida Game 6', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame6_200+Points.png', PRIZE_POINTS: 200, BRAND: 'sv', STOCK: 150 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu5', STICKER_NAME: 'Michelob Ultra Game 5', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame5_200+Points.png', PRIZE_POINTS: 200, BRAND: 'mu', STOCK: 150 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu6', STICKER_NAME: 'Michelob Ultra Game 6', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame6_200+Points.png', PRIZE_POINTS: 200, BRAND: 'mu', STOCK: 150 },

  // SIN PREMIO (Non-Prize stickers)
  { ALBUM_ID: 'HN', STICKER_ID: 'sv7', STICKER_NAME: 'Salva Vida Game 7 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame7_Non-Prize.png', PRIZE_POINTS: 0, BRAND: 'sv', STOCK: 999999 },
  { ALBUM_ID: 'HN', STICKER_ID: 'sv8', STICKER_NAME: 'Salva Vida Game 8 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_SalvaVidaStickerGame8_Non-Prize.png', PRIZE_POINTS: 0, BRAND: 'sv', STOCK: 999999 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu7', STICKER_NAME: 'Michelob Ultra Game 6 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame6_Non-Prize.png', PRIZE_POINTS: 0, BRAND: 'mu', STOCK: 999999 },
  { ALBUM_ID: 'HN', STICKER_ID: 'mu8', STICKER_NAME: 'Michelob Ultra Game 7 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/HN_MU+StickerGame7_Non-prize.png', PRIZE_POINTS: 0, BRAND: 'mu', STOCK: 999999 }
];

try {
  console.log('📝 Creando archivo Excel para álbum HN...');

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(HN_STICKERS);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 },  // ALBUM_ID
    { wch: 12 },  // STICKER_ID
    { wch: 30 },  // STICKER_NAME
    { wch: 100 }, // STICKER_URL
    { wch: 15 },  // PRIZE_POINTS
    { wch: 8 },   // BRAND
    { wch: 10 }   // STOCK
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Album HN');

  // Write file
  const filename = './Files/AlbumStockHN.xlsx';
  XLSX.writeFile(workbook, filename);

  console.log(`✅ Archivo creado exitosamente: ${filename}`);
  console.log(`📊 Total de stickers: ${HN_STICKERS.length}`);
  console.log(`   - Con premio 20000pts: ${HN_STICKERS.filter(s => s.PRIZE_POINTS === 20000).length} (Stock: 40)`);
  console.log(`   - Con premio 1000pts: ${HN_STICKERS.filter(s => s.PRIZE_POINTS === 1000).length} (Stock: 200)`);
  console.log(`   - Con premio 200pts: ${HN_STICKERS.filter(s => s.PRIZE_POINTS === 200).length} (Stock: 600)`);
  console.log(`   - Sin premio: ${HN_STICKERS.filter(s => s.PRIZE_POINTS === 0).length} (Stock ilimitado)`);

} catch (error) {
  console.error('❌ Error creando archivo Excel:', error);
  process.exit(1);
}
