// src/services/season.service.js
const httpStatus = require('http-status');
const { Season, Player, Match } = require('../models');
const { ApiError } = require('../middleware/error');
const logger = require('../utils/logger');

/**
 * Service xử lý mùa giải
 */
class SeasonService {
  /**
   * Tạo mùa giải mới
   * @param {Object} seasonData - Dữ liệu mùa giải
   * @returns {Promise<Season>}
   */
  async createSeason(seasonData) {
    try {
      // Kiểm tra xem có mùa giải active nào khác không
      if (seasonData.isActive) {
        await this.deactivateAllSeasons();
      }
      
      const season = await Season.create(seasonData);
      logger.info(`Đã tạo mùa giải mới: ${season.name}`);
      return season;
    } catch (error) {
      logger.error(`Lỗi tạo mùa giải: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy mùa giải theo ID
   * @param {string} id - ID mùa giải
   * @returns {Promise<Season>}
   */
  async getSeasonById(id) {
    try {
      const season = await Season.findById(id);
      if (!season) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy mùa giải');
      }
      return season;
    } catch (error) {
      logger.error(`Lỗi lấy thông tin mùa giải: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy danh sách mùa giải
   * @param {Object} filter - Bộ lọc
   * @param {Object} options - Tùy chọn phân trang và sắp xếp
   * @returns {Promise<Object>}
   */
  async querySeasons(filter = {}, options = {}) {
    try {
      const { limit = 10, page = 1, sortBy = 'startDate:desc' } = options;
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
      const seasons = await Season.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
      
      // Đếm tổng số
      const total = await Season.countDocuments(filter);
      
      return {
        results: seasons,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      };
    } catch (error) {
      logger.error(`Lỗi truy vấn mùa giải: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin mùa giải
   * @param {string} seasonId - ID mùa giải
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Season>}
   */
  async updateSeason(seasonId, updateData) {
    try {
      const season = await this.getSeasonById(seasonId);
      
      // Kiểm tra nếu đang kích hoạt mùa giải này
      if (updateData.isActive && updateData.isActive !== season.isActive) {
        await this.deactivateAllSeasons();
      }
      
      // Cập nhật và trả về mùa giải mới
      Object.assign(season, updateData);
      await season.save();
      
      logger.info(`Đã cập nhật mùa giải: ${season.name}`);
      return season;
    } catch (error) {
      logger.error(`Lỗi cập nhật mùa giải: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vô hiệu hóa tất cả các mùa giải
   * @returns {Promise}
   */
  async deactivateAllSeasons() {
    try {
      await Season.updateMany({}, { isActive: false });
      logger.info('Đã vô hiệu hóa tất cả các mùa giải');
    } catch (error) {
      logger.error(`Lỗi vô hiệu hóa mùa giải: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy mùa giải đang hoạt động
   * @returns {Promise<Season>}
   */
  async getActiveSeason() {
    try {
      const activeSeason = await Season.findOne({ isActive: true });
      if (!activeSeason) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không có mùa giải nào đang hoạt động');
      }
      return activeSeason;
    } catch (error) {
      logger.error(`Lỗi lấy mùa giải đang hoạt động: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kết thúc mùa giải và tính toán xếp hạng
   * @param {string} seasonId - ID mùa giải
   * @returns {Promise<Season>}
   */
  async endSeason(seasonId) {
    try {
      const season = await this.getSeasonById(seasonId);
      
      // Kiểm tra xem mùa giải đã kết thúc chưa
      if (!season.isActive) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mùa giải đã kết thúc');
      }
      
      // Tính toán bảng xếp hạng
      const rankings = await this.calculateSeasonRankings(seasonId);
      
      // Cập nhật mùa giải
      season.isActive = false;
      season.rankings = rankings;
      await season.save();
      
      // Lưu trữ thống kê mùa cho từng người chơi
      for (const ranking of rankings) {
        const player = await Player.findById(ranking.playerId);
        if (player) {
          // Lưu thống kê mùa vào player
          const seasonStats = {
            elo: ranking.elo,
            rank: ranking.rank,
            matches: player.matchesPlayed, // Đây chỉ là giá trị tổng, cần điều chỉnh để lấy chính xác số trận đấu trong mùa
            wins: player.wins // Đây chỉ là giá trị tổng, cần điều chỉnh để lấy chính xác số trận thắng trong mùa
          };
          
          player.seasonStats.set(seasonId.toString(), seasonStats);
          await player.save();
        }
      }
      
      logger.info(`Đã kết thúc mùa giải: ${season.name}`);
      return season;
    } catch (error) {
      logger.error(`Lỗi kết thúc mùa giải: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tính toán bảng xếp hạng cuối mùa
   * @param {string} seasonId - ID mùa giải
   * @returns {Promise<Array>}
   */
  async calculateSeasonRankings(seasonId) {
    try {
      // Lấy tất cả người chơi đã tham gia trận đấu trong mùa này
      const matches = await Match.find({ seasonId });
      
      // Trích xuất tất cả ID người chơi từ các trận đấu
      const playerIds = new Set();
      matches.forEach(match => {
        match.teams.blue.players.forEach(player => {
          playerIds.add(player.playerId.toString());
        });
        match.teams.red.players.forEach(player => {
          playerIds.add(player.playerId.toString());
        });
      });
      
      // Lấy thông tin người chơi
      const players = await Player.find({
        _id: { $in: Array.from(playerIds) }
      });
      
      // Tạo bảng xếp hạng
      const rankings = players
        .map(player => ({
          playerId: player._id,
          elo: player.currentElo,
          name: player.name // Có thể thêm nếu cần
        }))
        .sort((a, b) => b.elo - a.elo) // Sắp xếp theo ELO giảm dần
        .map((player, index) => ({
          ...player,
          rank: index + 1 // Thêm thứ hạng
        }));
      
      return rankings;
    } catch (error) {
      logger.error(`Lỗi tính toán bảng xếp hạng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật cài đặt mùa giải
   * @param {string} seasonId - ID mùa giải
   * @param {Object} settings - Cài đặt mới
   * @returns {Promise<Season>}
   */
  async updateSeasonSettings(seasonId, settings) {
    try {
      const season = await this.getSeasonById(seasonId);
      
      // Cập nhật cài đặt
      season.settings = {
        ...season.settings.toObject(),
        ...settings
      };
      
      await season.save();
      
      logger.info(`Đã cập nhật cài đặt mùa giải: ${season.name}`);
      return season;
    } catch (error) {
      logger.error(`Lỗi cập nhật cài đặt mùa giải: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SeasonService();