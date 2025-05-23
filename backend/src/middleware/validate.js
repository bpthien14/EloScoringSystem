// src/middleware/validate.js
const Joi = require('joi');
const httpStatus = require('http-status');
const { ApiError } = require('./error');

/**
 * Middleware để validate request theo schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  
  Object.assign(req, value);
  return next();
};

/**
 * Helper để chọn các trường từ một đối tượng
 * @param {Object} object - Đối tượng nguồn
 * @param {string[]} keys - Mảng các khóa cần lấy
 * @returns {Object} Object mới với các khóa được chọn
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

module.exports = {
  validate,
  pick
};