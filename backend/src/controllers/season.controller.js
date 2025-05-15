// src/controllers/season.controller.js
const httpStatus = require('http-status');
const seasonService = require('../services/season.service');
const { ApiError } = require('../middleware/error');
const logger = require('../utils/logger');

/**
 * Lấy danh sách mùa giải
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSeasons = async (req, res, next) => {
  try {
    // Xử lý các tham số lọc và phân trang
    const filter = {};
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.startDateFrom) {
      filter.startDate = { ...filter.startDate, $gte: new Date(req.query.startDateFrom) };
    }
    
    if (req.query.startDateTo) {
      filter.startDate = { ...filter.startDate, $lte: new Date(req.query.startDateTo) };
    }
    
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }

    // Xử lý phân trang và sắp xếp
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      page: req.query.page ? parseInt(req.query.page) : 1,
      sortBy: req.query.sortBy || 'startDate:desc'
    };

    // Gọi service để lấy dữ liệu
    const result = await seasonService.querySeasons(filter, options);
    
    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin mùa giải theo ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSeason = async (req, res, next) => {
  try {
    const season = await seasonService.getSeasonById(req.params.seasonId);
    res.send(season);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mùa giải mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createSeason = async (req, res, next) => {
  try {
    const season = await seasonService.createSeason(req.body);
    res.status(httpStatus.CREATED).send(season);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin mùa giải
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateSeason = async (req, res, next) => {
  try {
    const season = await seasonService.updateSeason(req.params.seasonId, req.body);
    res.send(season);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật cài đặt mùa giải
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateSeasonSettings = async (req, res, next) => {
  try {
    const season = await seasonService.updateSeasonSettings(
      req.params.seasonId,
      req.body.settings
    );
    res.send(season);
  } catch (error) {
    next(error);
  }
};

/**
 * Kết thúc mùa giải
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const endSeason = async (req, res, next) => {
  try {
    const season = await seasonService.endSeason(req.params.seasonId);
    res.send(season);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy mùa giải đang hoạt động
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getActiveSeason = async (req, res, next) => {
  try {
    const season = await seasonService.getActiveSeason();
    res.send(season);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSeasons,
  getSeason,
  createSeason,
  updateSeason,
  updateSeasonSettings,
  endSeason,
  getActiveSeason
};