// src/controllers/player.controller.js
const httpStatus = require('http-status');
const playerService = require('../services/player.service');
const { ApiError } = require('../middleware/error');
const logger = require('../utils/logger');

/**
 * Lấy danh sách người chơi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPlayers = async (req, res, next) => {
  try {
    // Xử lý các tham số lọc và phân trang
    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.preferredPosition) {
      filter.preferredPosition = req.query.preferredPosition;
    }
    if (req.query.minElo) {
      filter.currentElo = { ...filter.currentElo, $gte: parseInt(req.query.minElo) };
    }
    if (req.query.maxElo) {
      filter.currentElo = { ...filter.currentElo, $lte: parseInt(req.query.maxElo) };
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Xử lý phân trang và sắp xếp
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      page: req.query.page ? parseInt(req.query.page) : 1,
      sortBy: req.query.sortBy || 'currentElo:desc'
    };

    // Gọi service để lấy dữ liệu
    const result = await playerService.queryPlayers(filter, options);
    
    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin người chơi theo ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPlayer = async (req, res, next) => {
  try {
    const player = await playerService.getPlayerById(req.params.playerId);
    res.send(player);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo người chơi mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createPlayer = async (req, res, next) => {
  try {
    const player = await playerService.createPlayer(req.body);
    res.status(httpStatus.CREATED).send(player);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin người chơi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePlayer = async (req, res, next) => {
  try {
    const player = await playerService.updatePlayer(req.params.playerId, req.body);
    res.send(player);
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa người chơi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deletePlayer = async (req, res, next) => {
  try {
    await playerService.deletePlayer(req.params.playerId);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thống kê của người chơi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPlayerStats = async (req, res, next) => {
  try {
    const stats = await playerService.getPlayerStats(req.params.playerId);
    res.send(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerStats
};