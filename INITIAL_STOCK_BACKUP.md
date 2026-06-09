# 📦 Initial Stock Backup - Album Systems

This file contains the initial stock configurations for all album systems. Use these values to restore stock to original state if needed.

---

## 🇭🇳 Honduras (HN) - Initial Stock

**ALBUM_ID:** `HN`
**Total Prizes:** 840
**Total Stickers:** 16 (12 prize + 4 non-prize)

### Breakdown by Prize Level

| Prize Level | Total Stock | Stickers | Stock per Sticker |
|-------------|-------------|----------|-------------------|
| 20,000 pts  | 40          | 4        | 10 each           |
| 1,000 pts   | 200         | 4        | 50 each           |
| 200 pts     | 600         | 4        | 150 each          |
| 0 pts       | Unlimited   | 4        | 999999 each       |

### Detailed Sticker Configuration

**Salva Vida (Brand: sv)**
- `sv1` - Salva Vida Game 1 - 20,000 pts - Stock: 10
- `sv2` - Salva Vida Game 2 - 20,000 pts - Stock: 10
- `sv3` - Salva Vida Game 3 - 1,000 pts - Stock: 50
- `sv4` - Salva Vida Game 4 - 1,000 pts - Stock: 50
- `sv5` - Salva Vida Game 5 - 200 pts - Stock: 150
- `sv6` - Salva Vida Game 6 - 200 pts - Stock: 150
- `sv7` - Salva Vida Game 7 - No Prize - Stock: 999999
- `sv8` - Salva Vida Game 8 - No Prize - Stock: 999999

**Michelob Ultra (Brand: mu)**
- `mu1` - Michelob Ultra Game 1 - 20,000 pts - Stock: 10
- `mu2` - Michelob Ultra Game 2 - 20,000 pts - Stock: 10
- `mu3` - Michelob Ultra Game 3 - 1,000 pts - Stock: 50
- `mu4` - Michelob Ultra Game 4 - 1,000 pts - Stock: 50
- `mu5` - Michelob Ultra Game 5 - 200 pts - Stock: 150
- `mu6` - Michelob Ultra Game 6 - 200 pts - Stock: 150
- `mu7` - Michelob Ultra Game 7 - No Prize - Stock: 999999
- `mu8` - Michelob Ultra Game 8 - No Prize - Stock: 999999

### Prize Probabilities (HN)
- 200 pts: ~75%
- 1,000 pts: ~23%
- 20,000 pts: ~2%

---

## 🇸🇻 El Salvador (ESA/SV) - Initial Stock

**ALBUM_ID:** `SV`
**Total Prizes:** 3,184
**Total Stickers:** 16 (12 prize + 4 non-prize)

### Breakdown by Prize Level

| Prize Level | Total Stock | Stickers | Stock per Sticker |
|-------------|-------------|----------|-------------------|
| 20,000 pts  | 10          | 4        | 3+3+2+2           |
| 1,000 pts   | 1,592       | 4        | 398 each          |
| 200 pts     | 1,582       | 4        | 395-396 each      |
| 0 pts       | Unlimited   | 4        | 999999 each       |

### Detailed Sticker Configuration

**Pilsener (Brand: pilsener)**
- `sv1` - Pilsener Game 1 - 20,000 pts - Stock: 3
- `sv2` - Pilsener Game 2 - 20,000 pts - Stock: 3
- `sv3` - Pilsener Game 3 - 1,000 pts - Stock: 398
- `sv4` - Pilsener Game 4 - 1,000 pts - Stock: 398
- `sv5` - Pilsener Game 5 - 200 pts - Stock: 396
- `sv6` - Pilsener Game 6 - 200 pts - Stock: 396
- `sv7` - Pilsener Game 7 - No Prize - Stock: 999999
- `sv8` - Pilsener Game 8 - No Prize - Stock: 999999

**Michelob Ultra (Brand: mu)**
- `mu1` - Michelob Ultra Game 1 - 20,000 pts - Stock: 2
- `mu2` - Michelob Ultra Game 2 - 20,000 pts - Stock: 2
- `mu3` - Michelob Ultra Game 3 - 1,000 pts - Stock: 398
- `mu4` - Michelob Ultra Game 4 - 1,000 pts - Stock: 398
- `mu5` - Michelob Ultra Game 5 - 200 pts - Stock: 395
- `mu6` - Michelob Ultra Game 6 - 200 pts - Stock: 395
- `mu7` - Michelob Ultra Game 7 - No Prize - Stock: 999999
- `mu8` - Michelob Ultra Game 8 - No Prize - Stock: 999999

### Prize Probabilities (ESA)
- 200 pts: ~75%
- 1,000 pts: ~23%
- 20,000 pts: ~2%

---

## 🔄 How to Restore Stock

### Option 1: Using Existing Scripts (Recommended)

#### Restore Honduras (HN)
```bash
# 1. Regenerate Excel file
node scripts/createHNAlbumExcel.js

# 2. Load to MongoDB (will delete existing HN stock first)
node scripts/loadAlbumStockV2.js HN
```

#### Restore El Salvador (SV)
```bash
# 1. Regenerate Excel file
node scripts/createESAAlbumExcel.js

# 2. Load to MongoDB (will delete existing SV stock first)
node scripts/loadAlbumStockV2.js ESA
```

### Option 2: Using npm Scripts

```bash
# Restore Honduras
npm run create-hn-excel
npm run load-stock-hn

# Restore El Salvador
npm run create-esa-excel
npm run load-stock-esa
```

### Option 3: Manual MongoDB Reset

If you need to manually reset GANADORES counter without changing stock:

```javascript
// Connect to MongoDB
use ruleta;

// Reset Honduras winners
db.albumstocks.updateMany(
  { ALBUM_ID: 'HN' },
  { $set: { GANADORES: 0 } }
);

// Reset El Salvador winners
db.albumstocks.updateMany(
  { ALBUM_ID: 'SV' },
  { $set: { GANADORES: 0 } }
);

// Optionally delete winner records
db.albumwinners.deleteMany({ album_id: 'HN' });
db.albumwinners.deleteMany({ album_id: 'SV' });
```

---

## 📊 Verification Commands

After restoring stock, verify with these commands:

```bash
# Check Honduras stock
curl https://api-cn.onrender.com/api/album/stats/HN

# Check El Salvador stock
curl https://api-cn.onrender.com/api/album/stats/SV
```

**Expected Results:**
- HN: `total_prize_stock: 840`
- SV: `total_prize_stock: 3184`

---

## 📁 Related Files

- **Excel Generators:**
  - `scripts/createHNAlbumExcel.js` - Generates Honduras Excel
  - `scripts/createESAAlbumExcel.js` - Generates El Salvador Excel

- **Excel Files:**
  - `Files/AlbumStockHN.xlsx` - Honduras stock data
  - `Files/AlbumStockESA.xlsx` - El Salvador stock data

- **Loader Script:**
  - `scripts/loadAlbumStockV2.js` - Loads Excel to MongoDB

- **Documentation:**
  - `Albums/ESA_README.md` - El Salvador system documentation
  - `Albums/BRAZE_LOGS.md` - Braze integration documentation

---

## ⚠️ Important Notes

1. **loadAlbumStockV2.js Safety:** This script now deletes ONLY the specific album being loaded (based on ALBUM_ID in the Excel file). It will NOT delete other albums.

2. **GANADORES vs STOCK:**
   - `STOCK` = Total prizes allocated
   - `GANADORES` = Number of winners so far
   - Available = `STOCK - GANADORES`

3. **Brand Validation:** Ensure the AlbumStock model allows the following brands:
   - `sv` (Salva Vida)
   - `mu` (Michelob Ultra)
   - `pilsener` (Pilsener)
   - `other`

4. **Sticker URLs:** All images are hosted on AWS S3:
   - Honduras: `https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/HN/...`
   - El Salvador: `https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/ESA/...`

---

## 📅 Last Updated

**Date:** 2026-06-09
**Stock Versions:**
- Honduras (HN): v1.0 - 840 total prizes
- El Salvador (SV): v1.0 - 3,184 total prizes

---

## 🚨 Emergency Contacts

If stock needs to be restored urgently:
1. Check server logs: `npm run dev` or check Render.com logs
2. Verify MongoDB connection: `GET /health`
3. Test endpoints: `GET /api/album/stats/{ALBUM_ID}`
4. Download current winners before resetting: `GET /api/album/winners/download/{ALBUM_ID}`
