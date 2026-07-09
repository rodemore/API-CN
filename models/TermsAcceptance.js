const mongoose = require('mongoose');

const termsAcceptanceSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true
  },
  campaign: {
    type: String,
    required: true,
    default: 'Gloria en la cancha'
  },
  ip_address: {
    type: String,
    required: false
  },
  user_agent: {
    type: String,
    required: false
  },
  accepted_at: {
    type: Date,
    default: Date.now
  }
});

// Index para búsquedas rápidas por usuario y campaña
termsAcceptanceSchema.index({ userid: 1, campaign: 1 });

module.exports = mongoose.model('TermsAcceptance', termsAcceptanceSchema);
