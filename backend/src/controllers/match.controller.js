// src/controllers/match.controller.js
const httpStatus = require("http-status");
const matchService = require("../services/match.service");
const playerService = require("../services/player.service");
const seasonService = require("../services/season.service");
const { ApiError } = require("../middleware/error");
const logger = require("../utils/logger");

/**
 * Lấy danh sách trận đấu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMatches = async (req, res, next) => {
  try {
    // Xử lý các tham số lọc và phân trang
    const filter = {};

    if (req.query.seasonId) {
      filter.seasonId = req.query.seasonId;
    }

    if (req.query.startDate) {
      filter.matchDate = {
        ...filter.matchDate,
        $gte: new Date(req.query.startDate),
      };
    }

    if (req.query.endDate) {
      filter.matchDate = {
        ...filter.matchDate,
        $lte: new Date(req.query.endDate),
      };
    }

    if (req.query.isRandom !== undefined) {
      filter.isRandom = req.query.isRandom === "true";
    }

    if (req.query.playerId) {
      filter.$or = [
        { "teams.blue.players.playerId": req.query.playerId },
        { "teams.red.players.playerId": req.query.playerId },
      ];
    }

    // Xử lý phân trang và sắp xếp
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      page: req.query.page ? parseInt(req.query.page) : 1,
      sortBy: req.query.sortBy || "matchDate:desc",
      // Thêm tùy chọn populate dựa trên query param
      populate: req.query.populate === "true",
    };

    // Gọi service để lấy dữ liệu
    const result = await matchService.queryMatches(filter, options);

    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin trận đấu theo ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMatch = async (req, res, next) => {
  try {
    // Kiểm tra xem có yêu cầu populate thông tin người chơi không
    const populatePlayers = req.query.populate === "true";

    const match = await matchService.getMatchById(
      req.params.matchId,
      populatePlayers
    );
    res.send(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo trận đấu mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createMatch = async (req, res, next) => {
  try {
    const match = await matchService.createMatch(req.body);
    res.status(httpStatus.CREATED).send(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo trận đấu ngẫu nhiên
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createRandomMatch = async (req, res, next) => {
  try {
    const { seasonId, playerIds } = req.body;

    if (!seasonId) {
      // Nếu không cung cấp seasonId, lấy mùa giải đang hoạt động
      const activeSeason = await seasonService.getActiveSeason();
      req.body.seasonId = activeSeason.id;
    }

    const match = await matchService.createRandomMatch(
      req.body.seasonId,
      playerIds
    );

    res.status(httpStatus.CREATED).send(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật kết quả trận đấu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateMatchResult = async (req, res, next) => {
  try {
    const match = await matchService.updateMatchResult(
      req.params.matchId,
      req.body
    );

    res.send(match);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatches,
  getMatch,
  createMatch,
  createRandomMatch,
  updateMatchResult,
};
