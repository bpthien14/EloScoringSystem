// src/services/elo.service.js
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Service xử lý tính toán Elo
 */
class EloService {
  /**
   * Tính xác suất thắng dự đoán
   * @param {number} ratingA - Điểm Elo của đội A
   * @param {number} ratingB - Điểm Elo của đội B
   * @returns {number} Xác suất thắng của đội A
   */
  calculateExpectedWinRate(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  /**
   * Xác định hệ số K dựa trên số trận đã chơi
   * @param {number} matchesPlayed - Số trận đã chơi
   * @param {Object} kFactors - Các giá trị K
   * @returns {number} Hệ số K thích hợp
   */
  determineKFactor(matchesPlayed, kFactors) {
    if (matchesPlayed < 10) {
      return 40; // Calibration period
    } else if (matchesPlayed < 30) {
      return kFactors.new;
    } else if (matchesPlayed < 100) {
      return kFactors.regular;
    } else {
      return kFactors.experienced;
    }
  }

  /**
   * Tính hệ số hiệu suất dựa trên KDA
   * @param {Object} performanceStats - Thống kê hiệu suất
   * @returns {number} Hệ số hiệu suất
   */
  calculatePerformanceFactor(performanceStats) {
    const { kills = 0, deaths = 0, assists = 0 } = performanceStats;
    
    // Tính KDA
    const kda = (kills + assists) / Math.max(1, deaths);
    
    // Giới hạn trong khoảng [0.5, 1.5]
    return Math.min(1.5, Math.max(0.5, kda / 3));
  }

  /**
   * Tính hệ số streak (chuỗi thắng/thua)
   * @param {boolean} isWinner - Người chơi có thắng không
   * @param {number} winStreak - Chuỗi thắng hiện tại
   * @param {number} loseStreak - Chuỗi thua hiện tại
   * @returns {number} Hệ số streak
   */
  calculateStreakFactor(isWinner, winStreak, loseStreak) {
    if (isWinner) {
      return 1 + (winStreak * 0.02); // +2% cho mỗi trận thắng liên tiếp
    } else {
      return 1 - (loseStreak * 0.01); // -1% cho mỗi trận thua liên tiếp
    }
  }

  /**
   * Tính điểm Elo mới
   * @param {Object} params - Tham số tính toán
   * @returns {number} Điểm Elo mới
   */
  calculateNewElo({ 
    currentElo, 
    expectedWinRate, 
    actualWinRate, 
    kFactor, 
    positionFactor, 
    performanceFactor, 
    streakFactor,
    leftEarly
  }) {
    // Tính thay đổi Elo cơ bản
    let eloChange = kFactor * (actualWinRate - expectedWinRate);
    
    // Áp dụng các hệ số điều chỉnh
    eloChange *= positionFactor;
    eloChange *= performanceFactor;
    eloChange *= streakFactor;
    
    // Xử lý trường hợp người chơi rời trận sớm
    if (leftEarly && actualWinRate === 0) {
      eloChange *= 1.5; // Phạt thêm 50% điểm trừ
    }
    
    // Làm tròn đến số nguyên
    eloChange = Math.round(eloChange);
    
    // Trả về điểm Elo mới
    return currentElo + eloChange;
  }

  /**
   * Tính toán Elo cho một trận đấu hoàn chỉnh
   * @param {Object} match - Thông tin trận đấu
   * @param {Object} players - Map các người chơi
   * @param {Object} seasonSettings - Cài đặt mùa giải
   * @returns {Object} Kết quả tính toán Elo
   */
  calculateMatchElo(match, players, seasonSettings) {
    try {
      const { blue, red } = match.teams;
      const winnerTeamColor = match.winnerTeamColor;
      const { kFactors, positionFactors } = seasonSettings.settings;
      
      // Tính Elo trung bình của mỗi đội
      const blueTeamAvgElo = this.calculateTeamAverageElo(blue.players, players);
      const redTeamAvgElo = this.calculateTeamAverageElo(red.players, players);
      
      // Tính xác suất thắng dự đoán
      const blueTeamExpectedWinRate = this.calculateExpectedWinRate(blueTeamAvgElo, redTeamAvgElo);
      const redTeamExpectedWinRate = this.calculateExpectedWinRate(redTeamAvgElo, blueTeamAvgElo);
      
      // Kết quả thực tế
      const blueTeamActualWinRate = (winnerTeamColor === 'blue') ? 1 : 0;
      const redTeamActualWinRate = (winnerTeamColor === 'red') ? 1 : 0;
      
      // Tính toán Elo mới cho từng người chơi
      const results = {
        blue: this.calculateTeamEloChanges(blue.players, players, blueTeamExpectedWinRate, blueTeamActualWinRate, kFactors, positionFactors),
        red: this.calculateTeamEloChanges(red.players, players, redTeamExpectedWinRate, redTeamActualWinRate, kFactors, positionFactors),
        blueTeamAvgElo,
        redTeamAvgElo,
        blueTeamExpectedWinRate,
        redTeamExpectedWinRate
      };
      
      return results;
    } catch (error) {
      logger.error(`Lỗi tính toán Elo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tính Elo trung bình của đội
   * @param {Array} teamPlayers - Mảng người chơi trong đội
   * @param {Object} players - Map các người chơi
   * @returns {number} Elo trung bình
   */
  calculateTeamAverageElo(teamPlayers, players) {
    const totalElo = teamPlayers.reduce((sum, player) => {
      const playerData = players.get(player.playerId.toString());
      return sum + (playerData ? playerData.currentElo : config.elo.defaultElo);
    }, 0);
    
    return totalElo / teamPlayers.length;
  }

  /**
   * Tính toán thay đổi Elo cho cả đội
   * @param {Array} teamPlayers - Mảng người chơi trong đội
   * @param {Object} players - Map các người chơi
   * @param {number} expectedWinRate - Tỉ lệ thắng dự đoán
   * @param {number} actualWinRate - Kết quả thực tế (1 hoặc 0)
   * @param {Object} kFactors - Các hệ số K
   * @param {Object} positionFactors - Các hệ số vị trí
   * @returns {Array} Mảng kết quả tính toán
   */
  calculateTeamEloChanges(teamPlayers, players, expectedWinRate, actualWinRate, kFactors, positionFactors) {
    return teamPlayers.map(player => {
      const playerId = player.playerId.toString();
      const playerData = players.get(playerId);
      
      if (!playerData) {
        logger.error(`Không tìm thấy người chơi với ID: ${playerId}`);
        return {
          playerId,
          eloBefore: config.elo.defaultElo,
          eloAfter: config.elo.defaultElo,
          eloChange: 0,
          error: 'Người chơi không tồn tại'
        };
      }
      
      const currentElo = playerData.currentElo;
      const matchesPlayed = playerData.matchesPlayed;
      const kFactor = this.determineKFactor(matchesPlayed, kFactors);
      const positionFactor = positionFactors[player.position] || 1;
      const performanceFactor = this.calculatePerformanceFactor(player.performanceStats || {});
      const streakFactor = this.calculateStreakFactor(
        actualWinRate === 1,
        playerData.winStreak || 0,
        playerData.loseStreak || 0
      );
      
      const eloAfter = this.calculateNewElo({
        currentElo,
        expectedWinRate,
        actualWinRate,
        kFactor,
        positionFactor,
        performanceFactor,
        streakFactor,
        leftEarly: player.leftEarly || false
      });
      
      return {
        playerId,
        eloBefore: currentElo,
        eloAfter,
        eloChange: eloAfter - currentElo,
        kFactor,
        positionFactor,
        performanceFactor,
        streakFactor
      };
    });
  }
}

module.exports = new EloService();