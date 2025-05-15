// src/services/match.service.js
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const { Match, Player, Season } = require("../models");
const eloService = require("./elo.service");
const playerService = require("./player.service");
const { ApiError } = require("../middleware/error");
const logger = require("../utils/logger");

/**
 * Service xử lý trận đấu
 */
class MatchService {
  /**
   * Tạo trận đấu mới
   * @param {Object} matchData - Dữ liệu trận đấu
   * @returns {Promise<Match>}
   */
  async createMatch(matchData) {
    try {
      const match = await Match.create(matchData);
      logger.info(`Đã tạo trận đấu mới với ID: ${match.id}`);
      return match;
    } catch (error) {
      logger.error(`Lỗi tạo trận đấu: ${error.message}`);
      throw error;
    }
  }
  /**
   * Lấy trận đấu theo ID
   * @param {string} id - ID trận đấu
   * @param {boolean} populatePlayers - Có populate thông tin người chơi không
   * @returns {Promise<Match>}
   */
  async getMatchById(id, populatePlayers = false) {
    try {
      let query = Match.findById(id);

      if (populatePlayers) {
        // Populate thông tin chi tiết cho các người chơi trong cả hai team
        query = query.populate([
          {
            path: "teams.blue.players.playerId",
            select: "name currentElo preferredPosition winStreak loseStreak",
          },
          {
            path: "teams.red.players.playerId",
            select: "name currentElo preferredPosition winStreak loseStreak",
          },
        ]);
      }

      const match = await query;

      if (!match) {
        throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy trận đấu");
      }
      return match;
    } catch (error) {
      logger.error(`Lỗi lấy thông tin trận đấu: ${error.message}`);
      throw error;
    }
  }
  /**
   * Lấy danh sách trận đấu
   * @param {Object} filter - Bộ lọc
   * @param {Object} options - Tùy chọn phân trang và sắp xếp
   * @returns {Promise<Object>}
   */
  async queryMatches(filter = {}, options = {}) {
    try {
      const {
        limit = 20,
        page = 1,
        sortBy = "matchDate:desc",
        populate = false, // Thêm option để control populate
      } = options;
      const skip = (page - 1) * limit;

      // Xử lý sắp xếp
      const sortOptions = {};
      if (sortBy) {
        sortBy.split(",").forEach((sortOption) => {
          const [key, order] = sortOption.split(":");
          sortOptions[key] = order === "desc" ? -1 : 1;
        });
      }

      // Thực hiện truy vấn với populate nếu được yêu cầu
      let query = Match.find(filter).sort(sortOptions).skip(skip).limit(limit);

      if (populate) {
        query = query.populate([
          {
            path: "teams.blue.players.playerId",
            select: "name currentElo preferredPosition winStreak loseStreak",
          },
          {
            path: "teams.red.players.playerId",
            select: "name currentElo preferredPosition winStreak loseStreak",
          },
        ]);
      }

      const matches = await query;

      // Đếm tổng số
      const total = await Match.countDocuments(filter);

      return {
        results: matches,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      };
    } catch (error) {
      logger.error(`Lỗi truy vấn trận đấu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tạo trận đấu ngẫu nhiên
   * @param {string} seasonId - ID mùa giải
   * @param {Array} playerIds - Mảng ID người chơi
   * @returns {Promise<Match>}
   */
  async createRandomMatch(seasonId, playerIds) {
    try {
      // Kiểm tra số lượng người chơi
      if (playerIds.length !== 10) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Cần đúng 10 người chơi cho một trận đấu"
        );
      }

      // Lấy thông tin mùa giải
      const season = await Season.findById(seasonId);
      if (!season) {
        throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy mùa giải");
      }

      // Lấy thông tin tất cả người chơi
      const players = await Player.find({ _id: { $in: playerIds } });
      if (players.length !== 10) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Một số người chơi không tồn tại"
        );
      }

      // Xáo trộn người chơi để tạo đội ngẫu nhiên
      const shuffledPlayers = this.shuffleArray([...players]);

      // Chia thành 2 đội
      const blueTeamPlayers = shuffledPlayers.slice(0, 5);
      const redTeamPlayers = shuffledPlayers.slice(5, 10);

      // Cân bằng đội dựa trên Elo (optional)
      const [balancedBlueTeam, balancedRedTeam] =
        this.balanceTeams(shuffledPlayers);

      // Gán vị trí cho từng người chơi
      const positions = ["Top", "Jungle", "Mid", "ADC", "Support"];

      // Tạo đội xanh
      const blueTeam = {
        players: balancedBlueTeam.map((player, index) => ({
          playerId: player._id,
          position: positions[index],
          eloBefore: player.currentElo,
          eloAfter: player.currentElo, // Sẽ được cập nhật sau khi có kết quả
          eloChange: 0, // Sẽ được cập nhật sau khi có kết quả
          performanceStats: {}, // Sẽ được cập nhật sau khi có kết quả
          performanceFactor: 1,
          positionFactor:
            season.settings.positionFactors[positions[index]] || 1,
          streakFactor: 1,
          leftEarly: false,
        })),
        averageElo: this.calculateAverageElo(balancedBlueTeam),
        expectedWinRate: 0, // Sẽ được tính toán sau
      };

      // Tạo đội đỏ
      const redTeam = {
        players: balancedRedTeam.map((player, index) => ({
          playerId: player._id,
          position: positions[index],
          eloBefore: player.currentElo,
          eloAfter: player.currentElo, // Sẽ được cập nhật sau khi có kết quả
          eloChange: 0, // Sẽ được cập nhật sau khi có kết quả
          performanceStats: {}, // Sẽ được cập nhật sau khi có kết quả
          performanceFactor: 1,
          positionFactor:
            season.settings.positionFactors[positions[index]] || 1,
          streakFactor: 1,
          leftEarly: false,
        })),
        averageElo: this.calculateAverageElo(balancedRedTeam),
        expectedWinRate: 0, // Sẽ được tính toán sau
      };

      // Tính tỉ lệ thắng dự đoán
      blueTeam.expectedWinRate = eloService.calculateExpectedWinRate(
        blueTeam.averageElo,
        redTeam.averageElo
      );
      redTeam.expectedWinRate = eloService.calculateExpectedWinRate(
        redTeam.averageElo,
        blueTeam.averageElo
      );

      // Tạo trận đấu
      const matchData = {
        matchDate: new Date(),
        isRandom: true,
        duration: 0, // Sẽ được cập nhật sau khi có kết quả
        seasonId,
        teams: {
          blue: blueTeam,
          red: redTeam,
        },
        winnerTeamColor: null, // Sẽ được cập nhật sau khi có kết quả
      };

      const match = await this.createMatch(matchData);

      return match;
    } catch (error) {
      logger.error(`Lỗi tạo trận đấu ngẫu nhiên: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xáo trộn mảng (Fisher-Yates algorithm)
   * @param {Array} array - Mảng cần xáo trộn
   * @returns {Array} Mảng đã xáo trộn
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Tính điểm Elo trung bình của đội
   * @param {Array} players - Mảng người chơi
   * @returns {number} Điểm Elo trung bình
   */
  calculateAverageElo(players) {
    const totalElo = players.reduce(
      (sum, player) => sum + player.currentElo,
      0
    );
    return totalElo / players.length;
  }

  /**
   * Cân bằng đội dựa trên Elo
   * @param {Array} players - Mảng người chơi đã xáo trộn
   * @returns {Array} Mảng chứa 2 đội [blueTeam, redTeam]
   */
  balanceTeams(players) {
    // Sắp xếp người chơi theo Elo giảm dần
    const sortedPlayers = [...players].sort(
      (a, b) => b.currentElo - a.currentElo
    );

    const blueTeam = [];
    const redTeam = [];

    // Phân phối người chơi theo kiểu "snake draft" để cân bằng
    // 1, 4, 5, 8, 9 -> blueTeam
    // 2, 3, 6, 7, 10 -> redTeam
    for (let i = 0; i < sortedPlayers.length; i++) {
      if (i % 4 === 0 || i % 4 === 3) {
        blueTeam.push(sortedPlayers[i]);
      } else {
        redTeam.push(sortedPlayers[i]);
      }
    }

    return [blueTeam, redTeam];
  }

  /**
   * Cập nhật kết quả trận đấu
   * @param {string} matchId - ID trận đấu
   * @param {Object} resultData - Dữ liệu kết quả
   * @returns {Promise<Match>}
   */
  async updateMatchResult(matchId, resultData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Lấy thông tin trận đấu
      const match = await Match.findById(matchId);
      if (!match) {
        throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy trận đấu");
      }

      // Kiểm tra trận đấu đã có kết quả chưa
      if (match.winnerTeamColor) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Trận đấu đã có kết quả");
      }

      // Cập nhật thông tin cơ bản của trận đấu
      match.winnerTeamColor = resultData.winnerTeamColor;
      match.duration = resultData.duration || 0;

      // Lấy thông tin mùa giải
      const season = await Season.findById(match.seasonId);
      if (!season) {
        throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy mùa giải");
      }

      // Cập nhật thông tin hiệu suất cho từng người chơi (nếu có)
      if (
        resultData.playerPerformance &&
        resultData.playerPerformance.length > 0
      ) {
        const performanceMap = new Map();
        resultData.playerPerformance.forEach((perf) => {
          performanceMap.set(perf.playerId.toString(), perf);
        });

        // Cập nhật hiệu suất cho đội xanh
        match.teams.blue.players = match.teams.blue.players.map((player) => {
          const playerId = player.playerId.toString();
          const performance = performanceMap.get(playerId);

          if (performance) {
            player.performanceStats = performance.performanceStats || {};
            player.leftEarly = performance.leftEarly || false;
          }

          return player;
        });

        // Cập nhật hiệu suất cho đội đỏ
        match.teams.red.players = match.teams.red.players.map((player) => {
          const playerId = player.playerId.toString();
          const performance = performanceMap.get(playerId);

          if (performance) {
            player.performanceStats = performance.performanceStats || {};
            player.leftEarly = performance.leftEarly || false;
          }

          return player;
        });
      }

      // Lấy tất cả người chơi để cập nhật Elo
      const playerIds = [
        ...match.teams.blue.players.map((p) => p.playerId),
        ...match.teams.red.players.map((p) => p.playerId),
      ];

      const players = await Player.find({ _id: { $in: playerIds } });
      const playersMap = new Map();
      players.forEach((player) => {
        playersMap.set(player._id.toString(), player);
      });

      // Tính toán Elo mới
      const eloResults = eloService.calculateMatchElo(
        match,
        playersMap,
        season
      );

      // Cập nhật Elo mới vào trận đấu
      for (const player of match.teams.blue.players) {
        const playerId = player.playerId.toString();
        const eloResult = eloResults.blue.find((e) => e.playerId === playerId);

        if (eloResult) {
          player.eloAfter = eloResult.eloAfter;
          player.eloChange = eloResult.eloChange;
          player.performanceFactor = eloResult.performanceFactor;
          player.streakFactor = eloResult.streakFactor;
        }
      }

      for (const player of match.teams.red.players) {
        const playerId = player.playerId.toString();
        const eloResult = eloResults.red.find((e) => e.playerId === playerId);

        if (eloResult) {
          player.eloAfter = eloResult.eloAfter;
          player.eloChange = eloResult.eloChange;
          player.performanceFactor = eloResult.performanceFactor;
          player.streakFactor = eloResult.streakFactor;
        }
      }

      // Lưu trận đấu
      await match.save({ session });

      // Cập nhật Elo cho người chơi
      const updatePromises = [];

      match.teams.blue.players.forEach((player) => {
        const isWinner = match.winnerTeamColor === "blue";
        updatePromises.push(
          playerService.updatePlayerElo(
            player.playerId,
            player.eloAfter,
            isWinner,
            player.position
          )
        );
      });

      match.teams.red.players.forEach((player) => {
        const isWinner = match.winnerTeamColor === "red";
        updatePromises.push(
          playerService.updatePlayerElo(
            player.playerId,
            player.eloAfter,
            isWinner,
            player.position
          )
        );
      });

      await Promise.all(updatePromises);

      await session.commitTransaction();
      session.endSession();

      logger.info(`Đã cập nhật kết quả trận đấu ${matchId}`);
      return match;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      logger.error(`Lỗi cập nhật kết quả trận đấu: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new MatchService();
