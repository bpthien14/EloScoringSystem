// src/models/penalty.model.js
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const penaltySchema = mongoose.Schema(
  {
    playerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Player',
      required: true
    },
    matchId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Match',
      required: true
    },
    type: {
      type: String,
      enum: ['leave', 'afk', 'toxic', 'other'],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    penalty: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Thêm plugin để chuyển đổi Mongoose sang JSON
penaltySchema.plugin(toJSON);

// Thêm static methods
penaltySchema.statics.findByPlayer = async function(playerId) {
  return this.find({ playerId }).sort({ createdAt: -1 });
};

penaltySchema.statics.findByMatch = async function(matchId) {
  return this.find({ matchId }).populate('playerId', 'name');
};

/**
 * @typedef Penalty
 */
const Penalty = mongoose.model('Penalty', penaltySchema);

module.exports = Penalty;