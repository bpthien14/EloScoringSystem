// src/routes/statistic.routes.js
const express = require('express');
const statisticsController = require('../controllers/statistics.controller');
const router = express.Router();

// Lấy bảng xếp hạng tổng thể
router.get('/rankings', statisticsController.getRankings);

// Lấy thống kê theo vị trí
router.get('/positions', statisticsController.getPositionStats);

// Lấy lịch sử thay đổi ELO
router.get('/elo-history/:playerId', statisticsController.getEloHistory);

// Lấy thống kê mùa giải
router.get('/seasons/:seasonId', statisticsController.getSeasonStats);

// Lấy dự đoán kết quả trận đấu
router.post('/predict', statisticsController.predictMatchResult);

module.exports = router;