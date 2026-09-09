const mongoose = require('mongoose');

const timeWindowPrizeSchema = new mongoose.Schema({
  prize_name: {
    type: String,
    required: true
  },
  draw_datetime: {
    type: Date,
    required: true,
    index: true
  },
  is_claimed: {
    type: Boolean,
    default: false,
    index: true
  },
  winner_user_id: {
    type: String,
    default: null
  },
  claimed_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index compound para búsquedas eficientes
timeWindowPrizeSchema.index({ draw_datetime: 1, is_claimed: 1 });

module.exports = mongoose.model('TimeWindowPrize', timeWindowPrizeSchema);
