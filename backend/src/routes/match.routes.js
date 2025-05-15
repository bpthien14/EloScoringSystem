// src/routes/match.routes.js
const express = require('express');
const matchController = require('../controllers/match.controller');
const { validate } = require('../middleware/validate');
const matchValidation = require('../validations/match.validation');
const router = express.Router();

// Lấy danh sách trận đấu
router.get('/', validate(matchValidation.getMatches), matchController.getMatches);

// Tạo trận đấu mới
router.post('/', validate(matchValidation.createMatch), matchController.createMatch);

// Lấy thông tin trận đấu theo ID
router.get('/:matchId', validate(matchValidation.getMatch), matchController.getMatch);

// Tạo trận đấu ngẫu nhiên
router.post('/random', matchController.createRandomMatch);

// Cập nhật kết quả trận đấu
router.post('/:matchId/result', validate(matchValidation.updateMatch), matchController.updateMatchResult);

module.exports = router;