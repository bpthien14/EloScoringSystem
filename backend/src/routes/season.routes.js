// src/routes/season.routes.js
const express = require('express');
const seasonController = require('../controllers/season.controller');
const { validate } = require('../middleware/validate');
const seasonValidation = require('../validations/season.validation');
const router = express.Router();

// Lấy mùa giải đang hoạt động
router.get('/active', seasonController.getActiveSeason);

// Lấy danh sách mùa giải
router.get('/', validate(seasonValidation.getSeasons), seasonController.getSeasons);

// Tạo mùa giải mới
router.post('/', validate(seasonValidation.createSeason), seasonController.createSeason);

// Lấy thông tin mùa giải theo ID
router.get('/:seasonId', validate(seasonValidation.getSeason), seasonController.getSeason);

// Cập nhật thông tin mùa giải
router.put('/:seasonId', validate(seasonValidation.updateSeason), seasonController.updateSeason);

// Kết thúc mùa giải
router.post('/:seasonId/end', validate(seasonValidation.endSeason), seasonController.endSeason);

// Cập nhật cài đặt mùa giải
router.put('/:seasonId/settings', validate(seasonValidation.updateSeasonSettings), seasonController.updateSeasonSettings);

module.exports = router;