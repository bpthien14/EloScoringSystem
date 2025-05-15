// src/routes/player.routes.js
const express = require('express');
const playerController = require('../controllers/player.controller');
const { validate } = require('../middleware/validate');
const playerValidation = require('../validations/player.validation');
const router = express.Router();

// Lấy danh sách người chơi
router.get('/', validate(playerValidation.getPlayers), playerController.getPlayers);

// Tạo người chơi mới
router.post('/', validate(playerValidation.createPlayer), playerController.createPlayer);

// Lấy thông tin người chơi theo ID
router.get('/:playerId', validate(playerValidation.getPlayer), playerController.getPlayer);

// Cập nhật thông tin người chơi
router.put('/:playerId', validate(playerValidation.updatePlayer), playerController.updatePlayer);

// Xóa người chơi
router.delete('/:playerId', validate(playerValidation.deletePlayer), playerController.deletePlayer);

// Lấy thống kê của người chơi
router.get('/:playerId/stats', validate(playerValidation.getPlayerStats), playerController.getPlayerStats);

module.exports = router;