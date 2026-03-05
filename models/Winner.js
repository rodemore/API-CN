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
    type: mongoose.Schema.Types.Mixed, // Acepta Number o String (para "no_winner", "error")
    required: true
  },
  roulette_id: {
    type: Number,
    required: true
  },
  is_winner: {
    type: Boolean,
    default: true // Por defecto true para mantener compatibilidad con registros antiguos
  }
}, {
  timestamps: true  // Añade createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Winner', winnerSchema);
