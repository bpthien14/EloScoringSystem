// src/validations/custom.validation.js
const mongoose = require("mongoose");

/**
 * Custom validation for checking if a string is a valid MongoDB ObjectId
 * @param {string} value - Value to check
 * @param {object} helpers - Joi helpers
 * @returns {string|object} - Returns value if valid, otherwise returns an error
 */
const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message("{{#label}} phải là một ObjectId hợp lệ");
    }
    return value;
};

/**
 * Custom validation for checking if a string is a valid ISO date
 * @param {string} value - Value to check
 * @param {object} helpers - Joi helpers
 * @returns {string|object} - Returns value if valid, otherwise returns an error
 */
const dateISO = (value, helpers) => {
    if (
        !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?)?$/.test(
            value
        )
    ) {
        return helpers.message(
            "{{#label}} phải là định dạng ISO date hợp lệ (YYYY-MM-DD or YYYY-MM-DDThh:mm:ss)"
        );
    }
    return value;
};

/**
 * Custom validation for checking if a value is a valid email
 * @param {string} value - Value to check
 * @param {object} helpers - Joi helpers
 * @returns {string|object} - Returns value if valid, otherwise returns an error
 */
const email = (value, helpers) => {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        return helpers.message("{{#label}} phải là một địa chỉ email hợp lệ");
    }
    return value;
};

/**
 * Custom validation for checking if a password meets strength requirements
 * @param {string} value - Value to check
 * @param {object} helpers - Joi helpers
 * @returns {string|object} - Returns value if valid, otherwise returns an error
 */
const password = (value, helpers) => {
    if (value.length < 8) {
        return helpers.message("{{#label}} phải có ít nhất 8 ký tự");
    }
    if (!/\d/.test(value)) {
        return helpers.message("{{#label}} phải có ít nhất một chữ số");
    }
    if (!/[a-zA-Z]/.test(value)) {
        return helpers.message("{{#label}} phải có ít nhất một chữ cái");
    }
    return value;
};

module.exports = {
    objectId,
    dateISO,
    email,
    password,
};
