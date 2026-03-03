const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ID_PREMIO: {
    type: Number,
    required: true,
    unique: true
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

module.exports = mongoose.model('Stock', stockSchema);
