// src/models/season.model.js
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const positionFactorsSchema = new mongoose.Schema({
  Top: {
    type: Number,
    default: 1.1
  },
  Jungle: {
    type: Number,
    default: 1.2
  },
  Mid: {
    type: Number,
    default: 1.15
  },
  ADC: {
    type: Number,
    default: 1.1
  },
  Support: {
    type: Number,
    default: 0.9
  }
}, { _id: false });

const kFactorsSchema = new mongoose.Schema({
  new: {
    type: Number,
    default: 32
  },
  regular: {
    type: Number,
    default: 24
  },
  experienced: {
    type: Number,
    default: 16
  }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  kFactors: {
    type: kFactorsSchema,
    default: () => ({})
  },
  positionFactors: {
    type: positionFactorsSchema,
    default: () => ({})
  }
}, { _id: false });

const rankingSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Player',
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  elo: {
    type: Number,
    required: true
  }
}, { _id: false });

const seasonSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    settings: {
      type: settingsSchema,
      default: () => ({})
    },
    rankings: {
      type: [rankingSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Thêm plugin để chuyển đổi Mongoose sang JSON
seasonSchema.plugin(toJSON);

// Thêm static methods
seasonSchema.statics.findActive = async function() {
  return this.findOne({ isActive: true });
};

seasonSchema.statics.updateRankings = async function(seasonId, rankings) {
  return this.findByIdAndUpdate(
    seasonId,
    { rankings },
    { new: true }
  );
};

/**
 * @typedef Season
 */
const Season = mongoose.model('Season', seasonSchema);

module.exports = Season;