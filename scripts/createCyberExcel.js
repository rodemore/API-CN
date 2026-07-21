const XLSX = require('xlsx');
const path = require('path');

// Define prizes for Cyber roulette
const prizes = [
  { ID_PREMIO: 201, PREMIO: 'TV', Stock: 8, GANADORES: 0, ID_RULETA: 3, RULETA: 'Cyber' },
  { ID_PREMIO: 202, PREMIO: 'Celular', Stock: 8, GANADORES: 0, ID_RULETA: 3, RULETA: 'Cyber' },
  { ID_PREMIO: 203, PREMIO: '5000 puntos', Stock: 500, GANADORES: 0, ID_RULETA: 3, RULETA: 'Cyber' }
];

// Create workbook and worksheet
const ws = XLSX.utils.json_to_sheet(prizes);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Premios');

// Write file
const filePath = path.join(__dirname, '..', 'Files', 'PremiosCyber.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`✅ Excel file created: ${filePath}`);
console.log(`📊 Total prizes: ${prizes.reduce((sum, p) => sum + p.Stock, 0)}`);
console.log(`🎯 Win probability: ${(516 / 250000 * 100).toFixed(4)}%`);
