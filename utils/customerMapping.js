const XLSX = require('xlsx');
const path = require('path');

/**
 * Loads customer mapping from BASE ROBERT BLACK AND WHITE.xlsx
 * Creates a Map of external_id -> customer_account_id
 */
function loadCustomerMapping() {
  try {
    const filePath = path.join(__dirname, '../Files/BASE ROBERT BLACK AND WHITE.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Create a Map for fast lookup: external_id -> customer_account_id
    const mapping = new Map();
    data.forEach(row => {
      if (row.external_id && row.customer_account_id) {
        mapping.set(row.external_id, row.customer_account_id);
      }
    });

    console.log(`✅ Loaded ${mapping.size} customer mappings from Excel`);
    return mapping;
  } catch (error) {
    console.error('⚠️  Error loading customer mapping:', error.message);
    // Return empty map if file doesn't exist (e.g., in production without file)
    return new Map();
  }
}

/**
 * Get customer_account_id for a given external_id (user_id)
 * @param {string} externalId - The external_id (user_id)
 * @param {Map} mapping - The customer mapping (optional, will load if not provided)
 * @returns {string|null} The customer_account_id or null if not found
 */
function getCustomerAccountId(externalId, mapping = null) {
  if (!mapping) {
    mapping = loadCustomerMapping();
  }
  return mapping.get(externalId) || null;
}

module.exports = {
  loadCustomerMapping,
  getCustomerAccountId
};
