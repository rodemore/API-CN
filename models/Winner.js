const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  prize: {
    type: String,
    required: true
  },
  prize_id: {
    type: Number,
    required: true
  },
  roulette_id: {
    type: Number,
    required: true
  }
}, {
  timestamps: true  // Añade createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Winner', winnerSchema);
