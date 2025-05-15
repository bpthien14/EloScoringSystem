// src/controllers/statistics.controller.js
const httpStatus = require('http-status');
const statisticsService = require('../services/statistics.service');
const { ApiError } = require('../middleware/error');
const logger = require('../utils/logger');

/**
 * Lấy bảng xếp hạng tổng thể
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRankings = async (req, res, next) => {
  try {
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      seasonId: req.query.seasonId || null
    };
    
    const rankings = await statisticsService.getGlobalRankings(options);
    res.send(rankings);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thống kê theo vị trí
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPositionStats = async (req, res, next) => {
  try {
    const stats = await statisticsService.getPositionStats();
    res.send(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy lịch sử thay đổi ELO của người chơi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEloHistory = async (req, res, next) => {
  try {
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      seasonId: req.query.seasonId || null
    };
    
    const history = await statisticsService.getEloHistory(
      req.params.playerId,
      options
    );
    
    res.send(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thống kê mùa giải
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSeasonStats = async (req, res, next) => {
  try {
    const stats = await statisticsService.getSeasonStats(req.params.seasonId);
    res.send(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Dự đoán kết quả trận đấu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const predictMatchResult = async (req, res, next) => {
  try {
    const { blueTeam, redTeam } = req.body;
    
    if (!blueTeam || !redTeam) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cần cung cấp đủ thông tin của cả hai đội');
    }
    
    const prediction = await statisticsService.predictMatchResult(blueTeam, redTeam);
    res.send(prediction);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRankings,
  getPositionStats,
  getEloHistory,
  getSeasonStats,
  predictMatchResult
};