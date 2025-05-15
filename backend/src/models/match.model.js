// src/models/match.model.js
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const performanceStatsSchema = new mongoose.Schema({
  kills: {
    type: Number,
    default: 0
  },
  deaths: {
    type: Number,
    default: 0
  },
  assists: {
    type: Number,
    default: 0
  },
  damage: {
    type: Number,
    default: 0
  },
  gold: {
    type: Number,
    default: 0
  },
  cs: {
    type: Number,
    default: 0
  }
}, { _id: false });

const playerMatchSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Player',
    required: true
  },
  position: {
    type: String,
    enum: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
    required: true
  },
  eloBefore: {
    type: Number,
    required: true
  },
  eloAfter: {
    type: Number,
    required: true
  },
  eloChange: {
    type: Number,
    required: true
  },
  performanceStats: {
    type: performanceStatsSchema,
    default: () => ({})
  },
  performanceFactor: {
    type: Number,
    default: 1.0
  },
  positionFactor: {
    type: Number,
    default: 1.0
  },
  streakFactor: {
    type: Number,
    default: 1.0
  },
  leftEarly: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  players: [playerMatchSchema],
  averageElo: {
    type: Number,
    required: true
  },
  expectedWinRate: {
    type: Number,
    required: true
  }
}, { _id: false });

const matchSchema = mongoose.Schema(
  {
    matchDate: {
      type: Date,
      default: Date.now
    },
    isRandom: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 0
    },
    seasonId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Season',
      required: true
    },
    teams: {
      blue: {
        type: teamSchema,
        required: true
      },
      red: {
        type: teamSchema,
        required: true
      }
    },
    winnerTeamColor: {
      type: String,
      enum: ['blue', 'red'],
      required: false,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Thêm plugin để chuyển đổi Mongoose sang JSON
matchSchema.plugin(toJSON);

// Thêm các static methods
matchSchema.statics.findByPlayer = async function(playerId) {
  return this.find({
    $or: [
      { 'teams.blue.players.playerId': playerId },
      { 'teams.red.players.playerId': playerId }
    ]
  }).sort({ matchDate: -1 });
};

matchSchema.statics.findByPlayerAndSeason = async function(playerId, seasonId) {
  return this.find({
    seasonId,
    $or: [
      { 'teams.blue.players.playerId': playerId },
      { 'teams.red.players.playerId': playerId }
    ]
  }).sort({ matchDate: -1 });
};

/**
 * @typedef Match
 */
const Match = mongoose.model('Match', matchSchema);

module.exports = Match;