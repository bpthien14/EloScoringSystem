// src/models/player.model.js
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const positionStatSchema = new mongoose.Schema({
  matches: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  averageEloChange: {
    type: Number,
    default: 0
  }
}, { _id: false });

const seasonStatSchema = new mongoose.Schema({
  elo: {
    type: Number,
    default: 1000
  },
  matches: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  }
}, { _id: false });

const playerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    currentElo: {
      type: Number,
      default: 1000
    },
    matchesPlayed: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    preferredPosition: {
      type: String,
      enum: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
      default: 'Mid'
    },
    winStreak: {
      type: Number,
      default: 0
    },
    loseStreak: {
      type: Number,
      default: 0
    },
    positionStats: {
      Top: {
        type: positionStatSchema,
        default: () => ({})
      },
      Jungle: {
        type: positionStatSchema,
        default: () => ({})
      },
      Mid: {
        type: positionStatSchema,
        default: () => ({})
      },
      ADC: {
        type: positionStatSchema,
        default: () => ({})
      },
      Support: {
        type: positionStatSchema,
        default: () => ({})
      }
    },
    seasonStats: {
      type: Map,
      of: seasonStatSchema,
      default: () => ({})
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastMatchDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Thêm plugin để chuyển đổi Mongoose sang JSON
playerSchema.plugin(toJSON);

// Thêm phương thức ảo để tính win rate
playerSchema.virtual('winRate').get(function() {
  if (this.matchesPlayed === 0) return 0;
  return (this.wins / this.matchesPlayed) * 100;
});

// Thêm method để cập nhật ELO
playerSchema.methods.updateElo = function(newElo, win, position, matchId) {
  // Cập nhật ELO
  const oldElo = this.currentElo;
  this.currentElo = newElo;
  
  // Cập nhật số trận và thắng/thua
  this.matchesPlayed += 1;
  if (win) {
    this.wins += 1;
    this.winStreak += 1;
    this.loseStreak = 0;
  } else {
    this.losses += 1;
    this.loseStreak += 1;
    this.winStreak = 0;
  }
  
  // Cập nhật stats theo vị trí
  if (position) {
    const posStats = this.positionStats[position];
    posStats.matches = (posStats.matches || 0) + 1;
    if (win) {
      posStats.wins = (posStats.wins || 0) + 1;
    }
    
    // Cập nhật average ELO change
    const eloChange = newElo - oldElo;
    const oldAvg = posStats.averageEloChange || 0;
    const totalMatches = posStats.matches || 1;
    posStats.averageEloChange = ((oldAvg * (totalMatches - 1)) + eloChange) / totalMatches;
  }
  
  // Cập nhật ngày trận gần nhất
  this.lastMatchDate = new Date();
  
  return this;
};

/**
 * @typedef Player
 */
const Player = mongoose.model('Player', playerSchema);

module.exports = Player;