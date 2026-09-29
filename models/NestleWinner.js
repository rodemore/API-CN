const mongoose = require('mongoose');

const nestleWinnerSchema = new mongoose.Schema({
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
    ref: 'TimeWindowPrizeNestle',
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

module.exports = mongoose.model('NestleWinner', nestleWinnerSchema);
