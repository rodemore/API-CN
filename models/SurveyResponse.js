const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  id_pregunta: {
    type: String,
    required: true
  },
  pregunta: {
    type: String,
    required: true
  },
  opcion_seleccionada: {
    type: String,
    required: true
  },
  acierto: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for efficient queries
surveyResponseSchema.index({ user_id: 1, createdAt: -1 });
surveyResponseSchema.index({ id_pregunta: 1 });
surveyResponseSchema.index({ acierto: 1 });

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
