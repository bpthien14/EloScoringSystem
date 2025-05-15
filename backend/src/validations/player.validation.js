// src/validations/player.validation.js
const Joi = require("joi");
const { objectId, dateISO } = require("./custom.validation");

const createPlayer = {
    body: Joi.object()
        .keys({
            name: Joi.string().required().messages({
                "string.base": "Tên người chơi phải là chuỗi",
                "any.required": "Tên người chơi là trường bắt buộc",
            }),
            alias: Joi.string().messages({
                "string.base": "Biệt danh phải là chuỗi",
            }),
            preferredPosition: Joi.string()
                .valid("Top", "Jungle", "Mid", "ADC", "Support")
                .messages({
                    "string.base": "Vị trí ưa thích phải là chuỗi",
                    "any.only":
                        "Vị trí ưa thích không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                }),
            preferredPositions: Joi.array()
                .items(
                    Joi.string().valid("Top", "Jungle", "Mid", "ADC", "Support")
                )
                .messages({
                    "array.base": "Vị trí ưa thích phải là một mảng",
                    "any.only":
                        "Vị trí không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                }),
            currentElo: Joi.number().integer().messages({
                "number.base": "Điểm Elo hiện tại phải là số",
                "number.integer": "Điểm Elo hiện tại phải là số nguyên",
            }),
            roles: Joi.array().items(Joi.string()).messages({
                "array.base": "Vai trò phải là một mảng",
                "string.base": "Vai trò phải là chuỗi",
            }),
            isActive: Joi.boolean().default(true).messages({
                "boolean.base": "Trạng thái hoạt động phải là boolean",
            }),
        })
        .unknown(true),
};

const getPlayers = {
    query: Joi.object()
        .keys({
            name: Joi.string().messages({
                "string.base": "Tên người chơi phải là chuỗi",
            }),
            isActive: Joi.boolean().messages({
                "boolean.base": "Trạng thái hoạt động phải là boolean",
            }),
            preferredPosition: Joi.string()
                .valid("Top", "Jungle", "Mid", "ADC", "Support")
                .messages({
                    "string.base": "Vị trí ưa thích phải là chuỗi",
                    "any.only":
                        "Vị trí ưa thích không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                }),
            sortBy: Joi.string().messages({
                "string.base": "Trường sắp xếp phải là chuỗi",
            }),
            limit: Joi.number().integer().min(1).messages({
                "number.base": "Giới hạn phải là số",
                "number.integer": "Giới hạn phải là số nguyên",
                "number.min": "Giới hạn phải lớn hơn 0",
            }),
            page: Joi.number().integer().min(1).messages({
                "number.base": "Trang phải là số",
                "number.integer": "Trang phải là số nguyên",
                "number.min": "Trang phải lớn hơn 0",
            }),
        })
        .unknown(true),
};

const getPlayer = {
    params: Joi.object().keys({
        playerId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID người chơi phải là chuỗi",
            "any.required": "ID người chơi là trường bắt buộc",
            "string.pattern.name": "ID người chơi không hợp lệ",
        }),
    }),
};

const updatePlayer = {
    params: Joi.object().keys({
        playerId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID người chơi phải là chuỗi",
            "any.required": "ID người chơi là trường bắt buộc",
            "string.pattern.name": "ID người chơi không hợp lệ",
        }),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().messages({
                "string.base": "Tên người chơi phải là chuỗi",
            }),
            alias: Joi.string().messages({
                "string.base": "Biệt danh phải là chuỗi",
            }),
            preferredPositions: Joi.array()
                .items(
                    Joi.string().valid("Top", "Jungle", "Mid", "ADC", "Support")
                )
                .messages({
                    "array.base": "Vị trí ưa thích phải là một mảng",
                    "any.only":
                        "Vị trí không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                }),
            roles: Joi.array().items(Joi.string()).messages({
                "array.base": "Vai trò phải là một mảng",
                "string.base": "Vai trò phải là chuỗi",
            }),
            isActive: Joi.boolean().messages({
                "boolean.base": "Trạng thái hoạt động phải là boolean",
            }),
        })
        .unknown(true),
};

const deletePlayer = {
    params: Joi.object().keys({
        playerId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID người chơi phải là chuỗi",
            "any.required": "ID người chơi là trường bắt buộc",
            "string.pattern.name": "ID người chơi không hợp lệ",
        }),
    }),
};

const getPlayerStats = {
    params: Joi.object().keys({
        playerId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID người chơi phải là chuỗi",
            "any.required": "ID người chơi là trường bắt buộc",
            "string.pattern.name": "ID người chơi không hợp lệ",
        }),
    }),
    query: Joi.object()
        .keys({
            seasonId: Joi.string().custom(objectId).messages({
                "string.base": "ID mùa giải phải là chuỗi",
                "string.pattern.name": "ID mùa giải không hợp lệ",
            }),
            fromDate: Joi.string().custom(dateISO).messages({
                "string.base": "Ngày bắt đầu phải là chuỗi",
                "string.pattern.name": "Ngày bắt đầu không hợp lệ",
            }),
            toDate: Joi.string().custom(dateISO).messages({
                "string.base": "Ngày kết thúc phải là chuỗi",
                "string.pattern.name": "Ngày kết thúc không hợp lệ",
            }),
        })
        .unknown(true),
};

module.exports = {
    createPlayer,
    getPlayers,
    getPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerStats,
};
