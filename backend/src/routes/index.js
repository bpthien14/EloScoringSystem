// src/routes/index.js
const express = require('express');
const playerRoutes = require('./player.routes');
const matchRoutes = require('./match.routes');
const seasonRoutes = require('./season.routes');
const statisticRoutes = require('./statistic.routes');

const router = express.Router();

// Đăng ký các routes
router.use('/players', playerRoutes);
router.use('/matches', matchRoutes);
router.use('/seasons', seasonRoutes);
router.use('/statistics', statisticRoutes);

module.exports = router;