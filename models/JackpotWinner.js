const mongoose = require('mongoose');

const jackpotWinnerSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  is_winner: {
    type: Boolean,
    required: true,
    index: true
  },
  puntos: {
    type: Number,
    default: null
  },
  prize_id: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JackpotWinner', jackpotWinnerSchema);
