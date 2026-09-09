const mongoose = require('mongoose');

const jackpotStockSchema = new mongoose.Schema({
  ID_PREMIO: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  PUNTOS: {
    type: Number,
    required: true
  },
  Stock: {
    type: Number,
    required: true,
    default: 0
  },
  GANADORES: {
    type: Number,
    default: 0
  },
  PROBABILIDAD: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Index para búsquedas eficientes
jackpotStockSchema.index({ Stock: 1, GANADORES: 1 });

module.exports = mongoose.model('JackpotStock', jackpotStockSchema);
