// src/services/player.service.js
const httpStatus = require('http-status');
const { Player } = require('../models');
const { ApiError } = require('../middleware/error');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Service xử lý người chơi
 */
class PlayerService {
  /**
   * Tạo người chơi mới
   * @param {Object} playerData - Dữ liệu người chơi
   * @returns {Promise<Player>}
   */
  async createPlayer(playerData) {
    try {
      // Kiểm tra tên người chơi đã tồn tại chưa
      if (await Player.findOne({ name: playerData.name })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Tên người chơi đã tồn tại');
      }

      // Tạo người chơi mới với điểm ELO mặc định
      const player = await Player.create({
        ...playerData,
        currentElo: config.elo.defaultElo,
      });

      logger.info(`Đã tạo người chơi mới: ${player.name}`);
      return player;
    } catch (error) {
      logger.error(`Lỗi tạo người chơi: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy người chơi theo ID
   * @param {string} id - ID người chơi
   * @returns {Promise<Player>}
   */
  async getPlayerById(id) {
    try {
      const player = await Player.findById(id);
      if (!player) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người chơi');
      }
      return player;
    } catch (error) {
      logger.error(`Lỗi lấy thông tin người chơi: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy danh sách người chơi
   * @param {Object} filter - Bộ lọc
   * @param {Object} options - Tùy chọn phân trang và sắp xếp
   * @returns {Promise<Object>}
   */
  async queryPlayers(filter = {}, options = {}) {
    try {
      const { limit = 50, page = 1, sortBy = 'currentElo:desc' } = options;
      const skip = (page - 1) * limit;
      
      // Xử lý sắp xếp
      const sortOptions = {};
      if (sortBy) {
        sortBy.split(',').forEach((sortOption) => {
          const [key, order] = sortOption.split(':');
          sortOptions[key] = order === 'desc' ? -1 : 1;
        });
      }

      // Thực hiện truy vấn
      const players = await Player.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
      
      // Đếm tổng số
      const total = await Player.countDocuments(filter);
      
      return {
        results: players,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      };
    } catch (error) {
      logger.error(`Lỗi truy vấn người chơi: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người chơi
   * @param {string} playerId - ID người chơi
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Player>}
   */
  async updatePlayer(playerId, updateData) {
    try {
      const player = await this.getPlayerById(playerId);
      
      // Không cho phép cập nhật trực tiếp các trường thống kê
      const allowedFields = ['name', 'preferredPosition', 'isActive'];
      const sanitizedData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
      
      // Cập nhật và trả về người chơi mới
      Object.assign(player, sanitizedData);
      await player.save();
      
      logger.info(`Đã cập nhật người chơi: ${player.name}`);
      return player;
    } catch (error) {
      logger.error(`Lỗi cập nhật người chơi: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xóa người chơi
   * @param {string} playerId - ID người chơi
   * @returns {Promise<Player>}
   */
  async deletePlayer(playerId) {
    try {
      const player = await this.getPlayerById(playerId);
      await player.remove();
      
      logger.info(`Đã xóa người chơi: ${player.name}`);
      return player;
    } catch (error) {
      logger.error(`Lỗi xóa người chơi: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật điểm Elo cho người chơi
   * @param {string} playerId - ID người chơi
   * @param {number} newElo - Điểm Elo mới
   * @param {boolean} won - Thắng/thua
   * @param {string} position - Vị trí chơi
   * @returns {Promise<Player>}
   */
  async updatePlayerElo(playerId, newElo, won, position) {
    try {
      const player = await this.getPlayerById(playerId);
      
      // Sử dụng phương thức có sẵn để cập nhật Elo
      player.updateElo(newElo, won, position);
      await player.save();
      
      logger.info(`Đã cập nhật điểm Elo của ${player.name}: ${player.currentElo}`);
      return player;
    } catch (error) {
      logger.error(`Lỗi cập nhật điểm Elo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy thống kê của người chơi
   * @param {string} playerId - ID người chơi
   * @returns {Promise<Object>}
   */
  async getPlayerStats(playerId) {
    try {
      const player = await this.getPlayerById(playerId);
      
      // Tính win rate
      const winRate = player.matchesPlayed > 0 
        ? (player.wins / player.matchesPlayed) * 100 
        : 0;
      
      // Tính win rate theo từng vị trí
      const positionStats = {};
      Object.keys(player.positionStats).forEach(position => {
        const stats = player.positionStats[position];
        const posWinRate = stats.matches > 0 
          ? (stats.wins / stats.matches) * 100 
          : 0;
          
        positionStats[position] = {
          ...stats.toObject(),
          winRate: posWinRate
        };
      });
      
      return {
        id: player.id,
        name: player.name,
        currentElo: player.currentElo,
        matchesPlayed: player.matchesPlayed,
        wins: player.wins,
        losses: player.losses,
        winRate,
        preferredPosition: player.preferredPosition,
        winStreak: player.winStreak,
        loseStreak: player.loseStreak,
        positionStats,
        lastMatchDate: player.lastMatchDate
      };
    } catch (error) {
      logger.error(`Lỗi lấy thống kê người chơi: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cập nhật thống kê mùa cho người chơi
   * @param {string} playerId - ID người chơi
   * @param {string} seasonId - ID mùa
   * @param {Object} stats - Thống kê cần cập nhật
   * @returns {Promise<Player>}
   */
  async updatePlayerSeasonStats(playerId, seasonId, stats) {
    try {
      const player = await this.getPlayerById(playerId);
      
      // Cập nhật hoặc thêm mới thống kê mùa
      player.seasonStats.set(seasonId.toString(), stats);
      await player.save();
      
      logger.info(`Đã cập nhật thống kê mùa ${seasonId} cho người chơi ${player.name}`);
      return player;
    } catch (error) {
      logger.error(`Lỗi cập nhật thống kê mùa: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PlayerService();