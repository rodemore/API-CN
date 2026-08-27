const XLSX = require('xlsx');

const prizes = [
  { ID_PREMIO: 201, PREMIO: 'TV 43"', Stock: 5, GANADORES: 0, ID_RULETA: 5, RULETA: 'PY' },
  { ID_PREMIO: 202, PREMIO: 'Coolers', Stock: 5, GANADORES: 0, ID_RULETA: 5, RULETA: 'PY' },
  { ID_PREMIO: 203, PREMIO: 'Speaker', Stock: 110, GANADORES: 0, ID_RULETA: 5, RULETA: 'PY' },
  { ID_PREMIO: 204, PREMIO: '100 puntos', Stock: 8000, GANADORES: 0, ID_RULETA: 5, RULETA: 'PY' },
  { ID_PREMIO: 205, PREMIO: '200 puntos', Stock: 2300, GANADORES: 0, ID_RULETA: 5, RULETA: 'PY' },
  { ID_PREMIO: 206, PREMIO: '500 puntos', Stock: 900, GANADORES: 0, ID_RULETA: 5, RULETA: 'PY' },
  { ID_PREMIO: 207, PREMIO: '1000 puntos', Stock: 280, GANADORES: 0, ID_RULETA: 5, RULETA: 'PY' }
];

const worksheet = XLSX.utils.json_to_sheet(prizes);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Premios');
XLSX.writeFile(workbook, 'Files/PremiosPY.xlsx');

const totalStock = prizes.reduce((sum, p) => sum + p.Stock, 0);
console.log('✅ Archivo Files/PremiosPY.xlsx creado');
console.log(`📦 Total de premios: ${totalStock}`);
console.log('\n📋 Detalle:');
prizes.forEach(p => console.log(`   ${p.PREMIO}: ${p.Stock}`));
