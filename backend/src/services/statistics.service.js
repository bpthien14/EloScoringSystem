// src/services/statistics.service.js
const httpStatus = require('http-status');
const { Player, Match, Season } = require('../models');
const eloService = require('./elo.service');
const { ApiError } = require('../middleware/error');
const logger = require('../utils/logger');

/**
 * Service xử lý thống kê
 */
class StatisticsService {
  /**
   * Lấy bảng xếp hạng tổng thể
   * @param {Object} options - Tùy chọn phân trang và lọc
   * @returns {Promise<Array>}
   */
  async getGlobalRankings(options = {}) {
    try {
      const { limit = 20, seasonId = null } = options;
      
      // Nếu chỉ định mùa giải, lấy bảng xếp hạng của mùa đó
      if (seasonId) {
        const season = await Season.findById(seasonId);
        if (!season) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy mùa giải');
        }
        
        // Nếu mùa giải có rankings, trả về từ đó
        if (season.rankings && season.rankings.length > 0) {
          return {
            rankings: season.rankings.slice(0, limit),
            seasonInfo: {
              id: season.id,
              name: season.name,
              startDate: season.startDate,
              endDate: season.endDate,
              isActive: season.isActive
            }
          };
        }
      }
      
      // Trường hợp không có mùa giải cụ thể hoặc mùa giải chưa có rankings
      // Lấy người chơi có nhiều hơn 5 trận đấu và đang active
      const players = await Player.find({ 
        matchesPlayed: { $gte: 5 },
        isActive: true 
      })
      .sort({ currentElo: -1 })
      .limit(limit);
      
      // Tạo bảng xếp hạng
      const rankings = players.map((player, index) => {
        const winRate = player.matchesPlayed > 0 
          ? (player.wins / player.matchesPlayed) * 100 
          : 0;
          
        return {
          rank: index + 1,
          playerId: player.id,
          playerName: player.name,
          elo: player.currentElo,
          matchesPlayed: player.matchesPlayed,
          wins: player.wins,
          losses: player.losses,
          winRate: parseFloat(winRate.toFixed(2)),
          winStreak: player.winStreak,
          loseStreak: player.loseStreak
        };
      });
      
      return { rankings };
    } catch (error) {
      logger.error(`Lỗi lấy bảng xếp hạng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy thống kê theo vị trí
   * @returns {Promise<Object>}
   */
  async getPositionStats() {
    try {
      const players = await Player.find({ matchesPlayed: { $gte: 5 } });
      
      // Khởi tạo đối tượng chứa thống kê theo vị trí
      const positions = {
        Top: { matchesPlayed: 0, wins: 0, winRate: 0, avgElo: 0, playerCount: 0 },
        Jungle: { matchesPlayed: 0, wins: 0, winRate: 0, avgElo: 0, playerCount: 0 },
        Mid: { matchesPlayed: 0, wins: 0, winRate: 0, avgElo: 0, playerCount: 0 },
        ADC: { matchesPlayed: 0, wins: 0, winRate: 0, avgElo: 0, playerCount: 0 },
        Support: { matchesPlayed: 0, wins: 0, winRate: 0, avgElo: 0, playerCount: 0 }
      };
      
      // Tính toán thống kê cho mỗi vị trí
      players.forEach(player => {
        Object.keys(player.positionStats).forEach(position => {
          const stats = player.positionStats[position];
          
          if (stats.matches > 0) {
            positions[position].matchesPlayed += stats.matches;
            positions[position].wins += stats.wins;
            positions[position].avgElo += player.currentElo;
            positions[position].playerCount++;
          }
        });
      });
      
      // Tính toán tỷ lệ thắng và ELO trung bình
      Object.keys(positions).forEach(position => {
        if (positions[position].matchesPlayed > 0) {
          positions[position].winRate = parseFloat(
            ((positions[position].wins / positions[position].matchesPlayed) * 100).toFixed(2)
          );
        }
        
        if (positions[position].playerCount > 0) {
          positions[position].avgElo = Math.round(
            positions[position].avgElo / positions[position].playerCount
          );
        }
      });
      
      return { positions };
    } catch (error) {
      logger.error(`Lỗi lấy thống kê theo vị trí: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy lịch sử thay đổi ELO
   * @param {string} playerId - ID người chơi
   * @param {Object} options - Tùy chọn lọc
   * @returns {Promise<Array>}
   */
  async getEloHistory(playerId, options = {}) {
    try {
      const { limit = 20, seasonId = null } = options;
      
      // Tạo filter cho truy vấn match
      const filter = {
        $or: [
          { 'teams.blue.players.playerId': playerId },
          { 'teams.red.players.playerId': playerId }
        ]
      };
      
      if (seasonId) {
        filter.seasonId = seasonId;
      }
      
      // Lấy các trận đấu của người chơi
      const matches = await Match.find(filter)
        .sort({ matchDate: -1 })
        .limit(limit);
      
      // Tìm thông tin người chơi
      const player = await Player.findById(playerId);
      if (!player) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người chơi');
      }
      
      // Tạo lịch sử ELO
      const eloHistory = matches.map(match => {
        const isBlueTeam = match.teams.blue.players.some(
          p => p.playerId.toString() === playerId
        );
        
        const team = isBlueTeam ? match.teams.blue : match.teams.red;
        const playerInMatch = team.players.find(
          p => p.playerId.toString() === playerId
        );
        
        const isWinner = match.winnerTeamColor === (isBlueTeam ? 'blue' : 'red');
        
        return {
          matchId: match.id,
          matchDate: match.matchDate,
          eloBefore: playerInMatch.eloBefore,
          eloAfter: playerInMatch.eloAfter,
          eloChange: playerInMatch.eloChange,
          isWinner,
          position: playerInMatch.position,
          teamColor: isBlueTeam ? 'blue' : 'red'
        };
      });
      
      return {
        player: {
          id: player.id,
          name: player.name,
          currentElo: player.currentElo
        },
        eloHistory
      };
    } catch (error) {
      logger.error(`Lỗi lấy lịch sử ELO: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy thống kê mùa giải
   * @param {string} seasonId - ID mùa giải
   * @returns {Promise<Object>}
   */
  async getSeasonStats(seasonId) {
    try {
      const season = await Season.findById(seasonId);
      if (!season) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy mùa giải');
      }
      
      // Lấy tất cả trận đấu trong mùa
      const matches = await Match.find({ seasonId });
      
      // Tính toán các chỉ số thống kê
      const totalMatches = matches.length;
      let blueTotalWins = 0;
      let redTotalWins = 0;
      let totalMatchDuration = 0;
      let totalEloChanges = 0;
      const positionWins = {
        Top: { blue: 0, red: 0 },
        Jungle: { blue: 0, red: 0 },
        Mid: { blue: 0, red: 0 },
        ADC: { blue: 0, red: 0 },
        Support: { blue: 0, red: 0 }
      };
      
      matches.forEach(match => {
        // Thắng/thua theo màu đội
        if (match.winnerTeamColor === 'blue') {
          blueTotalWins++;
        } else {
          redTotalWins++;
        }
        
        // Thời gian trung bình
        totalMatchDuration += match.duration;
        
        // Tính tổng thay đổi ELO
        match.teams.blue.players.forEach(player => {
          totalEloChanges += Math.abs(player.eloChange);
          
          // Thắng/thua theo vị trí
          if (match.winnerTeamColor === 'blue') {
            positionWins[player.position].blue++;
          }
        });
        
        match.teams.red.players.forEach(player => {
          totalEloChanges += Math.abs(player.eloChange);
          
          // Thắng/thua theo vị trí
          if (match.winnerTeamColor === 'red') {
            positionWins[player.position].red++;
          }
        });
      });
      
      // Tính trung bình
      const avgMatchDuration = totalMatches > 0 ? totalMatchDuration / totalMatches : 0;
      const avgEloChange = totalMatches > 0 ? totalEloChanges / (totalMatches * 10) : 0;
      
      // Tính tỷ lệ thắng theo màu đội
      const blueWinRate = totalMatches > 0 ? (blueTotalWins / totalMatches) * 100 : 0;
      const redWinRate = totalMatches > 0 ? (redTotalWins / totalMatches) * 100 : 0;
      
      // Lấy người chơi nổi bật (top 5 ELO)
      const topPlayers = await Player.find({})
        .sort({ currentElo: -1 })
        .limit(5);
      
      const topPlayerStats = topPlayers.map(player => ({
        id: player.id,
        name: player.name,
        elo: player.currentElo,
        wins: player.wins,
        losses: player.losses,
        winRate: player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0
      }));
      
      return {
        seasonInfo: {
          id: season.id,
          name: season.name,
          startDate: season.startDate,
          endDate: season.endDate,
          isActive: season.isActive
        },
        matchStats: {
          totalMatches,
          blueTotalWins,
          redTotalWins,
          blueWinRate: parseFloat(blueWinRate.toFixed(2)),
          redWinRate: parseFloat(redWinRate.toFixed(2)),
          avgMatchDuration: Math.round(avgMatchDuration),
          avgEloChange: Math.round(avgEloChange)
        },
        positionWins,
        topPlayers: topPlayerStats
      };
    } catch (error) {
      logger.error(`Lỗi lấy thống kê mùa giải: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy thông tin dự đoán kết quả trận đấu
   * @param {Array} blueTeam - Mảng ID người chơi đội xanh
   * @param {Array} redTeam - Mảng ID người chơi đội đỏ
   * @returns {Promise<Object>}
   */
  async predictMatchResult(blueTeam, redTeam) {
    try {
      // Kiểm tra số lượng người chơi
      if (blueTeam.length !== 5 || redTeam.length !== 5) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mỗi đội cần đúng 5 người chơi');
      }
      
      // Lấy thông tin người chơi
      const allPlayerIds = [...blueTeam, ...redTeam];
      const players = await Player.find({ _id: { $in: allPlayerIds } });
      
      if (players.length !== 10) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Một số người chơi không tồn tại');
      }
      
      // Tạo map người chơi để dễ truy cập
      const playerMap = new Map();
      players.forEach(player => {
        playerMap.set(player.id.toString(), player);
      });
      
      // Tính ELO trung bình của mỗi đội
      const blueTeamPlayers = blueTeam.map(id => playerMap.get(id.toString())).filter(Boolean);
      const redTeamPlayers = redTeam.map(id => playerMap.get(id.toString())).filter(Boolean);
      
      const blueTeamAvgElo = this.calculateAverageElo(blueTeamPlayers);
      const redTeamAvgElo = this.calculateAverageElo(redTeamPlayers);
      
      // Tính xác suất thắng dự đoán
      const blueTeamWinProbability = eloService.calculateExpectedWinRate(blueTeamAvgElo, redTeamAvgElo) * 100;
      const redTeamWinProbability = 100 - blueTeamWinProbability;
      
      // Dự đoán các thay đổi ELO
      const blueTeamPredictedEloChanges = blueTeamPlayers.map(player => ({
        playerId: player.id,
        playerName: player.name,
        currentElo: player.currentElo,
        predictedEloChange: this.calculatePredictedEloChange(
          player.currentElo,
          blueTeamWinProbability / 100,
          1, // Giả sử thắng
          24 // K-factor mặc định
        )
      }));
      
      const redTeamPredictedEloChanges = redTeamPlayers.map(player => ({
        playerId: player.id,
        playerName: player.name,
        currentElo: player.currentElo,
        predictedEloChange: this.calculatePredictedEloChange(
          player.currentElo,
          redTeamWinProbability / 100,
          1, // Giả sử thắng
          24 // K-factor mặc định
        )
      }));
      
      return {
        blueTeamAvgElo: Math.round(blueTeamAvgElo),
        redTeamAvgElo: Math.round(redTeamAvgElo),
        blueTeamWinProbability: parseFloat(blueTeamWinProbability.toFixed(2)),
        redTeamWinProbability: parseFloat(redTeamWinProbability.toFixed(2)),
        predictedEloChanges: {
          blue: blueTeamPredictedEloChanges,
          red: redTeamPredictedEloChanges
        }
      };
    } catch (error) {
      logger.error(`Lỗi dự đoán kết quả trận đấu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tính điểm ELO trung bình của đội
   * @param {Array} players - Mảng người chơi
   * @returns {number} Điểm ELO trung bình
   */
  calculateAverageElo(players) {
    if (!players || players.length === 0) return 0;
    
    const totalElo = players.reduce((sum, player) => sum + player.currentElo, 0);
    return totalElo / players.length;
  }

  /**
   * Tính thay đổi ELO dự đoán
   * @param {number} currentElo - ELO hiện tại
   * @param {number} expectedWinRate - Tỷ lệ thắng dự đoán
   * @param {number} actualWinRate - Kết quả thực tế (1 hoặc 0)
   * @param {number} kFactor - Hệ số K
   * @returns {number} Thay đổi ELO dự đoán
   */
  calculatePredictedEloChange(currentElo, expectedWinRate, actualWinRate, kFactor) {
    const eloChange = kFactor * (actualWinRate - expectedWinRate);
    return Math.round(eloChange);
  }
}

module.exports = new StatisticsService();