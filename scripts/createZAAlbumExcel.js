const XLSX = require('xlsx');

// Stock para Sudáfrica (ZA) según imagen
// 4 versiones: Castle Lager, Flying Fish, Carling Black Label, All Brands (Collection)

const ZA_STICKERS = [
  // ============================================
  // CASTLE LAGER BRAND
  // Qty x Points = Total Allocation
  // Total: 115,250 points allocation
  // ============================================
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle1_10', STICKER_NAME: 'Castle Lager 10pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_10pts.png', PRIZE_POINTS: 10, BRAND: 'castle', STOCK: 1150 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle2_20', STICKER_NAME: 'Castle Lager 20pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_20pts.png', PRIZE_POINTS: 20, BRAND: 'castle', STOCK: 1000 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle3_30', STICKER_NAME: 'Castle Lager 30pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_30pts.png', PRIZE_POINTS: 30, BRAND: 'castle', STOCK: 950 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle4_40', STICKER_NAME: 'Castle Lager 40pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_40pts.png', PRIZE_POINTS: 40, BRAND: 'castle', STOCK: 600 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle5_50', STICKER_NAME: 'Castle Lager 50pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_50pts.png', PRIZE_POINTS: 50, BRAND: 'castle', STOCK: 420 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle6_75', STICKER_NAME: 'Castle Lager 75pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_75pts.png', PRIZE_POINTS: 75, BRAND: 'castle', STOCK: 150 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle7_100', STICKER_NAME: 'Castle Lager 100pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_100pts.png', PRIZE_POINTS: 100, BRAND: 'castle', STOCK: 45 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle8_200', STICKER_NAME: 'Castle Lager 200pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_200pts.png', PRIZE_POINTS: 200, BRAND: 'castle', STOCK: 30 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle9_250', STICKER_NAME: 'Castle Lager 250pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_250pts.png', PRIZE_POINTS: 250, BRAND: 'castle', STOCK: 12 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle10_500', STICKER_NAME: 'Castle Lager 500pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_500pts.png', PRIZE_POINTS: 500, BRAND: 'castle', STOCK: 3 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle_np1', STICKER_NAME: 'Castle Lager No Prize 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_NoPrize1.png', PRIZE_POINTS: 0, BRAND: 'castle', STOCK: 999999 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'castle_np2', STICKER_NAME: 'Castle Lager No Prize 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CastleLager_NoPrize2.png', PRIZE_POINTS: 0, BRAND: 'castle', STOCK: 999999 },

  // ============================================
  // FLYING FISH BRAND
  // Qty x Points = Total Allocation
  // Total: 114,500 points allocation
  // ============================================
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish1_10', STICKER_NAME: 'Flying Fish 10pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_10pts.png', PRIZE_POINTS: 10, BRAND: 'fish', STOCK: 1150 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish2_20', STICKER_NAME: 'Flying Fish 20pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_20pts.png', PRIZE_POINTS: 20, BRAND: 'fish', STOCK: 900 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish3_30', STICKER_NAME: 'Flying Fish 30pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_30pts.png', PRIZE_POINTS: 30, BRAND: 'fish', STOCK: 800 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish4_40', STICKER_NAME: 'Flying Fish 40pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_40pts.png', PRIZE_POINTS: 40, BRAND: 'fish', STOCK: 500 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish5_50', STICKER_NAME: 'Flying Fish 50pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_50pts.png', PRIZE_POINTS: 50, BRAND: 'fish', STOCK: 320 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish6_75', STICKER_NAME: 'Flying Fish 75pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_75pts.png', PRIZE_POINTS: 75, BRAND: 'fish', STOCK: 150 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish7_100', STICKER_NAME: 'Flying Fish 100pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_100pts.png', PRIZE_POINTS: 100, BRAND: 'fish', STOCK: 35 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish8_200', STICKER_NAME: 'Flying Fish 200pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_200pts.png', PRIZE_POINTS: 200, BRAND: 'fish', STOCK: 30 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish9_250', STICKER_NAME: 'Flying Fish 250pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_250pts.png', PRIZE_POINTS: 250, BRAND: 'fish', STOCK: 12 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish10_500', STICKER_NAME: 'Flying Fish 500pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_500pts.png', PRIZE_POINTS: 500, BRAND: 'fish', STOCK: 3 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish_np1', STICKER_NAME: 'Flying Fish No Prize 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_NoPrize1.png', PRIZE_POINTS: 0, BRAND: 'fish', STOCK: 999999 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'fish_np2', STICKER_NAME: 'Flying Fish No Prize 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_FlyingFish_NoPrize2.png', PRIZE_POINTS: 0, BRAND: 'fish', STOCK: 999999 },

  // ============================================
  // CARLING BLACK LABEL
  // Qty x Points = Total Allocation
  // Total: 115,250 points allocation
  // ============================================
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling1_10', STICKER_NAME: 'Carling Black Label 10pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_10pts.png', PRIZE_POINTS: 10, BRAND: 'carling', STOCK: 1150 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling2_20', STICKER_NAME: 'Carling Black Label 20pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_20pts.png', PRIZE_POINTS: 20, BRAND: 'carling', STOCK: 1000 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling3_30', STICKER_NAME: 'Carling Black Label 30pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_30pts.png', PRIZE_POINTS: 30, BRAND: 'carling', STOCK: 900 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling4_40', STICKER_NAME: 'Carling Black Label 40pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_40pts.png', PRIZE_POINTS: 40, BRAND: 'carling', STOCK: 600 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling5_50', STICKER_NAME: 'Carling Black Label 50pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_50pts.png', PRIZE_POINTS: 50, BRAND: 'carling', STOCK: 420 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling6_75', STICKER_NAME: 'Carling Black Label 75pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_75pts.png', PRIZE_POINTS: 75, BRAND: 'carling', STOCK: 150 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling7_100', STICKER_NAME: 'Carling Black Label 100pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_100pts.png', PRIZE_POINTS: 100, BRAND: 'carling', STOCK: 45 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling8_200', STICKER_NAME: 'Carling Black Label 200pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_200pts.png', PRIZE_POINTS: 200, BRAND: 'carling', STOCK: 30 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling9_250', STICKER_NAME: 'Carling Black Label 250pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_250pts.png', PRIZE_POINTS: 250, BRAND: 'carling', STOCK: 12 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling10_500', STICKER_NAME: 'Carling Black Label 500pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_500pts.png', PRIZE_POINTS: 500, BRAND: 'carling', STOCK: 3 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling_np1', STICKER_NAME: 'Carling Black Label No Prize 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_NoPrize1.png', PRIZE_POINTS: 0, BRAND: 'carling', STOCK: 999999 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'carling_np2', STICKER_NAME: 'Carling Black Label No Prize 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_CarlingBlackLabel_NoPrize2.png', PRIZE_POINTS: 0, BRAND: 'carling', STOCK: 999999 },

  // ============================================
  // ALL BRANDS / COLLECTION
  // Qty x Points = Total Allocation
  // Total: 17,250 points allocation
  // ============================================
  { ALBUM_ID: 'ZA', STICKER_ID: 'all1_10', STICKER_NAME: 'All Brands 10pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_10pts.png', PRIZE_POINTS: 10, BRAND: 'all', STOCK: 50 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all2_20', STICKER_NAME: 'All Brands 20pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_20pts.png', PRIZE_POINTS: 20, BRAND: 'all', STOCK: 100 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all3_30', STICKER_NAME: 'All Brands 30pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_30pts.png', PRIZE_POINTS: 30, BRAND: 'all', STOCK: 100 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all4_40', STICKER_NAME: 'All Brands 40pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_40pts.png', PRIZE_POINTS: 40, BRAND: 'all', STOCK: 50 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all5_50', STICKER_NAME: 'All Brands 50pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_50pts.png', PRIZE_POINTS: 50, BRAND: 'all', STOCK: 40 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all6_75', STICKER_NAME: 'All Brands 75pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_75pts.png', PRIZE_POINTS: 75, BRAND: 'all', STOCK: 50 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all7_100', STICKER_NAME: 'All Brands 100pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_100pts.png', PRIZE_POINTS: 100, BRAND: 'all', STOCK: 25 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all8_200', STICKER_NAME: 'All Brands 200pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_200pts.png', PRIZE_POINTS: 200, BRAND: 'all', STOCK: 10 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all9_250', STICKER_NAME: 'All Brands 250pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_250pts.png', PRIZE_POINTS: 250, BRAND: 'all', STOCK: 4 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all10_500', STICKER_NAME: 'All Brands 500pts', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_500pts.png', PRIZE_POINTS: 500, BRAND: 'all', STOCK: 1 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all_np1', STICKER_NAME: 'All Brands No Prize 1', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_NoPrize1.png', PRIZE_POINTS: 0, BRAND: 'all', STOCK: 999999 },
  { ALBUM_ID: 'ZA', STICKER_ID: 'all_np2', STICKER_NAME: 'All Brands No Prize 2', STICKER_URL: 'https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ZA/ZA_AllBrands_NoPrize2.png', PRIZE_POINTS: 0, BRAND: 'all', STOCK: 999999 }
];

try {
  console.log('📝 Creando archivo Excel para álbum Sudáfrica (ZA)...');

  // Verificar totales por marca
  const castleTotal = ZA_STICKERS.filter(s => s.BRAND === 'castle' && s.PRIZE_POINTS > 0).reduce((sum, s) => sum + s.STOCK, 0);
  const fishTotal = ZA_STICKERS.filter(s => s.BRAND === 'fish' && s.PRIZE_POINTS > 0).reduce((sum, s) => sum + s.STOCK, 0);
  const carlingTotal = ZA_STICKERS.filter(s => s.BRAND === 'carling' && s.PRIZE_POINTS > 0).reduce((sum, s) => sum + s.STOCK, 0);
  const allTotal = ZA_STICKERS.filter(s => s.BRAND === 'all' && s.PRIZE_POINTS > 0).reduce((sum, s) => sum + s.STOCK, 0);
  const totalPrizes = castleTotal + fishTotal + carlingTotal + allTotal;

  console.log('📊 Verificación de stock por marca:');
  console.log(`   Castle Lager: ${castleTotal} stickers con premio`);
  console.log(`   Flying Fish: ${fishTotal} stickers con premio`);
  console.log(`   Carling Black Label: ${carlingTotal} stickers con premio`);
  console.log(`   All Brands: ${allTotal} stickers con premio`);
  console.log(`   Total stickers con premio: ${totalPrizes.toLocaleString()}`);

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(ZA_STICKERS);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 },  // ALBUM_ID
    { wch: 15 },  // STICKER_ID
    { wch: 35 },  // STICKER_NAME
    { wch: 100 }, // STICKER_URL
    { wch: 15 },  // PRIZE_POINTS
    { wch: 12 },  // BRAND
    { wch: 10 }   // STOCK
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Album ZA');

  // Write file
  const filename = './Files/AlbumStockZA.xlsx';
  XLSX.writeFile(workbook, filename);

  console.log(`✅ Archivo creado exitosamente: ${filename}`);
  console.log(`📊 Total de stickers: ${ZA_STICKERS.length}`);
  console.log(`   - Castle Lager: ${ZA_STICKERS.filter(s => s.BRAND === 'castle').length} stickers`);
  console.log(`   - Flying Fish: ${ZA_STICKERS.filter(s => s.BRAND === 'fish').length} stickers`);
  console.log(`   - Carling Black Label: ${ZA_STICKERS.filter(s => s.BRAND === 'carling').length} stickers`);
  console.log(`   - All Brands: ${ZA_STICKERS.filter(s => s.BRAND === 'all').length} stickers`);
  console.log(`\n✅ Total de premios disponibles: ${totalPrizes.toLocaleString()}`);

} catch (error) {
  console.error('❌ Error creando archivo Excel:', error);
  process.exit(1);
}
