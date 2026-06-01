const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  team1: {
    type: String,
    required: true
  },
  team2: {
    type: String,
    required: true
  },
  team1_goals: {
    type: Number,
    required: true,
    min: 0
  },
  team2_goals: {
    type: Number,
    required: true,
    min: 0
  },
  userid: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);
