// src/config/database.js
const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Kết nối đến MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info(`MongoDB kết nối thành công: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB
};