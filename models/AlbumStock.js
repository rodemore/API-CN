const mongoose = require('mongoose');

const albumStockSchema = new mongoose.Schema({
  ALBUM_ID: {
    type: String,
    required: true,
    enum: ['HN', 'GT', 'SV', 'NI', 'CR', 'PA', 'DO', 'EC', 'PY', 'BO', 'ZA', 'ARG'] // Códigos de países disponibles (ZA = South Africa, ARG = Argentina)
  },
  STICKER_ID: {
    type: String,
    required: true
  },
  STICKER_NAME: {
    type: String,
    required: true
  },
  STICKER_URL: {
    type: String,
    required: true
  },
  PRIZE_POINTS: {
    type: Number,
    required: true,
    min: 0
  },
  BRAND: {
    type: String,
    required: true,
    enum: ['sv', 'mu', 'pilsener', 'castle', 'fish', 'carling', 'all', 'MUL', 'QUI', 'other']
    // sv = Salva Vida, mu = Michelob Ultra, pilsener = Pilsener
    // castle = Castle Lager, fish = Flying Fish, carling = Carling Black Label, all = All Brands
    // MUL = Michelob Ultra Argentina, QUI = Quilmes Argentina
  },
  IS_PRIZE: {
    type: Boolean,
    required: true,
    default: false
  },
  STOCK: {
    type: Number,
    required: true,
    min: 0
  },
  GANADORES: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound unique index for ALBUM_ID and STICKER_ID
albumStockSchema.index({ ALBUM_ID: 1, STICKER_ID: 1 }, { unique: true });

// Index for efficient queries
albumStockSchema.index({ ALBUM_ID: 1, IS_PRIZE: 1 });
albumStockSchema.index({ ALBUM_ID: 1, PRIZE_POINTS: 1 });

module.exports = mongoose.model('AlbumStock', albumStockSchema);
