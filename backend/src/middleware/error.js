// src/middleware/error.js
const httpStatus = require('http-status');
const logger = require('../utils/logger');

/**
 * Chuyển đổi lỗi thành ApiError
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

/**
 * Xử lý lỗi và gửi response
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  const response = {
    status: 'error',
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

/**
 * Định nghĩa lớp ApiError
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = {
  errorConverter,
  errorHandler,
  ApiError,
};