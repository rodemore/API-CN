const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ID_PREMIO: {
    type: Number,
    required: true
  },
  PREMIO: {
    type: String,
    required: true
  },
  Stock: {
    type: Number,
    required: true,
    min: 0
  },
  GANADORES: {
    type: Number,
    default: 0,
    min: 0
  },
  ID_RULETA: {
    type: Number,
    required: true,
    default: 1
  },
  RULETA: {
    type: String,
    required: true
  }
}, {
  timestamps: true  // Añade createdAt y updatedAt automáticamente
});

// Create compound unique index for ID_PREMIO and ID_RULETA
// This allows same prize IDs across different roulettes
stockSchema.index({ ID_PREMIO: 1, ID_RULETA: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);
