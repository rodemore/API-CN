const mongoose = require('mongoose');

const albumWinnerSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  album_id: {
    type: String,
    required: true,
    enum: ['HN', 'GT', 'SV', 'NI', 'CR', 'PA', 'DO', 'EC', 'PY', 'BO', 'ZA']
  },
  pack_stickers: {
    type: [{
      sticker_id: String,
      sticker_name: String,
      sticker_url: String,
      prize_points: Number,
      brand: String,
      is_prize: Boolean
    }],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 3; // Debe tener exactamente 3 stickers por pack
      },
      message: 'Each pack must contain exactly 3 stickers'
    }
  },
  total_prize_points: {
    type: Number,
    required: true,
    min: 0
  },
  prize_sticker: {
    sticker_id: String,
    sticker_name: String,
    prize_points: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
albumWinnerSchema.index({ album_id: 1, createdAt: -1 });
albumWinnerSchema.index({ user_id: 1, album_id: 1 });
albumWinnerSchema.index({ total_prize_points: -1 });

module.exports = mongoose.model('AlbumWinner', albumWinnerSchema);
