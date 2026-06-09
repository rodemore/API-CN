const XLSX = require('xlsx');

// Stock para El Salvador según screenshot
// 20K pts: 10
// 1K pts: 1,592
// 200 pts: 1,582
// Total: 3,184 premios

const ESA_STICKERS = [
  // PREMIO: 20000 puntos (10 total - distribuidos en 4 stickers)
  { ALBUM_ID: 'SV', STICKER_ID: 'sv1', STICKER_NAME: 'Pilsener Game 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame1_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'pilsener', STOCK: 3 },
  { ALBUM_ID: 'SV', STICKER_ID: 'sv2', STICKER_NAME: 'Pilsener Game 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame2_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'pilsener', STOCK: 3 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu1', STICKER_NAME: 'Michelob Ultra Game 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame1_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'mu', STOCK: 2 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu2', STICKER_NAME: 'Michelob Ultra Game 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame2_20K+Points.png', PRIZE_POINTS: 20000, BRAND: 'mu', STOCK: 2 },

  // PREMIO: 1000 puntos (1,592 total - distribuidos en 4 stickers = 398 cada uno)
  { ALBUM_ID: 'SV', STICKER_ID: 'sv3', STICKER_NAME: 'Pilsener Game 3', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame3_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'pilsener', STOCK: 398 },
  { ALBUM_ID: 'SV', STICKER_ID: 'sv4', STICKER_NAME: 'Pilsener Game 4', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame4_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'pilsener', STOCK: 398 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu3', STICKER_NAME: 'Michelob Ultra Game 3', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame3_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'mu', STOCK: 398 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu4', STICKER_NAME: 'Michelob Ultra Game 4', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame4_1K+Points.png', PRIZE_POINTS: 1000, BRAND: 'mu', STOCK: 398 },

  // PREMIO: 200 puntos (1,582 total - distribuidos en 4 stickers = 395-396 cada uno)
  { ALBUM_ID: 'SV', STICKER_ID: 'sv5', STICKER_NAME: 'Pilsener Game 5', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame5_200+Points.png', PRIZE_POINTS: 200, BRAND: 'pilsener', STOCK: 396 },
  { ALBUM_ID: 'SV', STICKER_ID: 'sv6', STICKER_NAME: 'Pilsener Game 6', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame6_200+Points.png', PRIZE_POINTS: 200, BRAND: 'pilsener', STOCK: 396 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu5', STICKER_NAME: 'Michelob Ultra Game 5', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame5_200+Points.png', PRIZE_POINTS: 200, BRAND: 'mu', STOCK: 395 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu6', STICKER_NAME: 'Michelob Ultra Game 6', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame6_200+Points.png', PRIZE_POINTS: 200, BRAND: 'mu', STOCK: 395 },

  // SIN PREMIO (Non-Prize stickers - stock ilimitado)
  { ALBUM_ID: 'SV', STICKER_ID: 'sv7', STICKER_NAME: 'Pilsener Game 7 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame7_Non-Prize.png', PRIZE_POINTS: 0, BRAND: 'pilsener', STOCK: 999999 },
  { ALBUM_ID: 'SV', STICKER_ID: 'sv8', STICKER_NAME: 'Pilsener Game 8 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_PilsenerStickerGame8_Non-Prize.png', PRIZE_POINTS: 0, BRAND: 'pilsener', STOCK: 999999 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu7', STICKER_NAME: 'Michelob Ultra Game 7 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame7_Non-Prize.png', PRIZE_POINTS: 0, BRAND: 'mu', STOCK: 999999 },
  { ALBUM_ID: 'SV', STICKER_ID: 'mu8', STICKER_NAME: 'Michelob Ultra Game 8 - No Prize', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/ESA_MU+StickerGame8_Non-prize.png', PRIZE_POINTS: 0, BRAND: 'mu', STOCK: 999999 }
];

try {
  console.log('📝 Creando archivo Excel para álbum El Salvador (ESA)...');

  // Verificar totales
  const total20k = ESA_STICKERS.filter(s => s.PRIZE_POINTS === 20000).reduce((sum, s) => sum + s.STOCK, 0);
  const total1k = ESA_STICKERS.filter(s => s.PRIZE_POINTS === 1000).reduce((sum, s) => sum + s.STOCK, 0);
  const total200 = ESA_STICKERS.filter(s => s.PRIZE_POINTS === 200).reduce((sum, s) => sum + s.STOCK, 0);
  const totalPrizes = total20k + total1k + total200;

  console.log('📊 Verificación de stock:');
  console.log(`   20K pts: ${total20k} (debe ser 10)`);
  console.log(`   1K pts: ${total1k} (debe ser 1,592)`);
  console.log(`   200 pts: ${total200} (debe ser 1,582)`);
  console.log(`   Total premios: ${totalPrizes} (debe ser 3,184)`);

  if (totalPrizes !== 3184) {
    console.warn(`⚠️ Advertencia: Total de premios ${totalPrizes} no coincide con 3,184`);
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(ESA_STICKERS);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 },  // ALBUM_ID
    { wch: 12 },  // STICKER_ID
    { wch: 30 },  // STICKER_NAME
    { wch: 100 }, // STICKER_URL
    { wch: 15 },  // PRIZE_POINTS
    { wch: 10 },  // BRAND
    { wch: 10 }   // STOCK
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Album ESA');

  // Write file
  const filename = './Files/AlbumStockESA.xlsx';
  XLSX.writeFile(workbook, filename);

  console.log(`✅ Archivo creado exitosamente: ${filename}`);
  console.log(`📊 Total de stickers: ${ESA_STICKERS.length}`);
  console.log(`   - Con premio 20000pts: ${ESA_STICKERS.filter(s => s.PRIZE_POINTS === 20000).length} stickers (Stock: ${total20k})`);
  console.log(`   - Con premio 1000pts: ${ESA_STICKERS.filter(s => s.PRIZE_POINTS === 1000).length} stickers (Stock: ${total1k})`);
  console.log(`   - Con premio 200pts: ${ESA_STICKERS.filter(s => s.PRIZE_POINTS === 200).length} stickers (Stock: ${total200})`);
  console.log(`   - Sin premio: ${ESA_STICKERS.filter(s => s.PRIZE_POINTS === 0).length} (Stock ilimitado)`);
  console.log(`\n✅ Total de premios disponibles: ${totalPrizes.toLocaleString()}`);

} catch (error) {
  console.error('❌ Error creando archivo Excel:', error);
  process.exit(1);
}
