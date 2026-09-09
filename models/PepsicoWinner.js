const mongoose = require('mongoose');

const pepsicoWinnerSchema = new mongoose.Schema({
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
  prize_name: {
    type: String,
    default: null
  },
  prize_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeWindowPrize',
    default: null
  },
  play_datetime: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PepsicoWinner', pepsicoWinnerSchema);
