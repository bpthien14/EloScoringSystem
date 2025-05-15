// src/validations/season.validation.js
const Joi = require("joi");
const { objectId, dateISO } = require("./custom.validation");

const createSeason = {
    body: Joi.object().keys({
        name: Joi.string().required().messages({
            "string.base": "Tên mùa giải phải là chuỗi",
            "any.required": "Tên mùa giải là trường bắt buộc",
        }),
        startDate: Joi.string().custom(dateISO).required().messages({
            "string.base": "Ngày bắt đầu phải là chuỗi",
            "any.required": "Ngày bắt đầu là trường bắt buộc",
            "string.pattern.name": "Ngày bắt đầu không hợp lệ",
        }),
        endDate: Joi.string().custom(dateISO).messages({
            "string.base": "Ngày kết thúc phải là chuỗi",
            "string.pattern.name": "Ngày kết thúc không hợp lệ",
        }),
        description: Joi.string().messages({
            "string.base": "Mô tả mùa giải phải là chuỗi",
        }),
        settings: Joi.object({
            kFactors: Joi.object({
                new: Joi.number().min(1).max(100),
                regular: Joi.number().min(1).max(100),
                experienced: Joi.number().min(1).max(100),
            }).unknown(true),
            positionFactors: Joi.object({
                Top: Joi.number().min(0.5).max(1.5),
                Jungle: Joi.number().min(0.5).max(1.5),
                Mid: Joi.number().min(0.5).max(1.5),
                ADC: Joi.number().min(0.5).max(1.5),
                Support: Joi.number().min(0.5).max(1.5),
            }).unknown(true),
            kFactor: Joi.number().min(1).max(100).messages({
                "number.base": "Hệ số K phải là số",
                "number.min": "Hệ số K không thể nhỏ hơn 1",
                "number.max": "Hệ số K không thể lớn hơn 100",
            }),
            initialElo: Joi.number().min(0).max(5000).messages({
                "number.base": "Điểm Elo ban đầu phải là số",
                "number.min": "Điểm Elo ban đầu không thể âm",
                "number.max": "Điểm Elo ban đầu không thể lớn hơn 5000",
            }),
            performanceWeight: Joi.number().min(0).max(1).messages({
                "number.base": "Trọng số hiệu suất phải là số",
                "number.min": "Trọng số hiệu suất không thể âm",
                "number.max": "Trọng số hiệu suất không thể lớn hơn 1",
            }),
            streakWeight: Joi.number().min(0).max(1).messages({
                "number.base": "Trọng số chuỗi thắng/thua phải là số",
                "number.min": "Trọng số chuỗi thắng/thua không thể âm",
                "number.max": "Trọng số chuỗi thắng/thua không thể lớn hơn 1",
            }),
            positionWeights: Joi.object({
                Top: Joi.number().min(0.5).max(1.5).messages({
                    "number.base": "Trọng số vị trí Top phải là số",
                    "number.min": "Trọng số vị trí Top không thể nhỏ hơn 0.5",
                    "number.max": "Trọng số vị trí Top không thể lớn hơn 1.5",
                }),
                Jungle: Joi.number().min(0.5).max(1.5).messages({
                    "number.base": "Trọng số vị trí Jungle phải là số",
                    "number.min":
                        "Trọng số vị trí Jungle không thể nhỏ hơn 0.5",
                    "number.max":
                        "Trọng số vị trí Jungle không thể lớn hơn 1.5",
                }),
                Mid: Joi.number().min(0.5).max(1.5).messages({
                    "number.base": "Trọng số vị trí Mid phải là số",
                    "number.min": "Trọng số vị trí Mid không thể nhỏ hơn 0.5",
                    "number.max": "Trọng số vị trí Mid không thể lớn hơn 1.5",
                }),
                ADC: Joi.number().min(0.5).max(1.5).messages({
                    "number.base": "Trọng số vị trí ADC phải là số",
                    "number.min": "Trọng số vị trí ADC không thể nhỏ hơn 0.5",
                    "number.max": "Trọng số vị trí ADC không thể lớn hơn 1.5",
                }),
                Support: Joi.number().min(0.5).max(1.5).messages({
                    "number.base": "Trọng số vị trí Support phải là số",
                    "number.min":
                        "Trọng số vị trí Support không thể nhỏ hơn 0.5",
                    "number.max":
                        "Trọng số vị trí Support không thể lớn hơn 1.5",
                }),
            }),
        }).unknown(true),
    }).unknown(true),

};

const updateSeason = {
    params: Joi.object().keys({
        seasonId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID mùa giải phải là chuỗi",
            "any.required": "ID mùa giải là trường bắt buộc",
            "string.pattern.name": "ID mùa giải không hợp lệ",
        }),
    }),
    body: Joi.object().keys({
        name: Joi.string().messages({
            "string.base": "Tên mùa giải phải là chuỗi",
        }),
        startDate: Joi.string().custom(dateISO).messages({
            "string.base": "Ngày bắt đầu phải là chuỗi",
            "string.pattern.name": "Ngày bắt đầu không hợp lệ",
        }),
        endDate: Joi.string().custom(dateISO).messages({
            "string.base": "Ngày kết thúc phải là chuỗi",
            "string.pattern.name": "Ngày kết thúc không hợp lệ",
        }),
        description: Joi.string().messages({
            "string.base": "Mô tả mùa giải phải là chuỗi",
        }),
        isActive: Joi.boolean().messages({
            "boolean.base": "Trạng thái hoạt động phải là boolean",
        }),
    }).unknown(true),
};

const updateSeasonSettings = {
    params: Joi.object().keys({
        seasonId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID mùa giải phải là chuỗi",
            "any.required": "ID mùa giải là trường bắt buộc",
            "string.pattern.name": "ID mùa giải không hợp lệ",
        }),
    }),
    body: Joi.object().keys({
        kFactors: Joi.object({
            new: Joi.number().min(1).max(100),
            regular: Joi.number().min(1).max(100),
            experienced: Joi.number().min(1).max(100),
        }).unknown(true),
        positionFactors: Joi.object({
            Top: Joi.number().min(0.5).max(1.5),
            Jungle: Joi.number().min(0.5).max(1.5),
            Mid: Joi.number().min(0.5).max(1.5),
            ADC: Joi.number().min(0.5).max(1.5),
            Support: Joi.number().min(0.5).max(1.5),
        }).unknown(true),
        kFactor: Joi.number().min(1).max(100).messages({
            "number.base": "Hệ số K phải là số",
            "number.min": "Hệ số K không thể nhỏ hơn 1",
            "number.max": "Hệ số K không thể lớn hơn 100",
        }),
        initialElo: Joi.number().min(0).max(5000).messages({
            "number.base": "Điểm Elo ban đầu phải là số",
            "number.min": "Điểm Elo ban đầu không thể âm",
            "number.max": "Điểm Elo ban đầu không thể lớn hơn 5000",
        }),
        performanceWeight: Joi.number().min(0).max(1).messages({
            "number.base": "Trọng số hiệu suất phải là số",
            "number.min": "Trọng số hiệu suất không thể âm",
            "number.max": "Trọng số hiệu suất không thể lớn hơn 1",
        }),
        streakWeight: Joi.number().min(0).max(1).messages({
            "number.base": "Trọng số chuỗi thắng/thua phải là số",
            "number.min": "Trọng số chuỗi thắng/thua không thể âm",
            "number.max": "Trọng số chuỗi thắng/thua không thể lớn hơn 1",
        }),
        positionWeights: Joi.object({
            Top: Joi.number().min(0.5).max(1.5).messages({
                "number.base": "Trọng số vị trí Top phải là số",
                "number.min": "Trọng số vị trí Top không thể nhỏ hơn 0.5",
                "number.max": "Trọng số vị trí Top không thể lớn hơn 1.5",
            }),
            Jungle: Joi.number().min(0.5).max(1.5).messages({
                "number.base": "Trọng số vị trí Jungle phải là số",
                "number.min": "Trọng số vị trí Jungle không thể nhỏ hơn 0.5",
                "number.max": "Trọng số vị trí Jungle không thể lớn hơn 1.5",
            }),
            Mid: Joi.number().min(0.5).max(1.5).messages({
                "number.base": "Trọng số vị trí Mid phải là số",
                "number.min": "Trọng số vị trí Mid không thể nhỏ hơn 0.5",
                "number.max": "Trọng số vị trí Mid không thể lớn hơn 1.5",
            }),
            ADC: Joi.number().min(0.5).max(1.5).messages({
                "number.base": "Trọng số vị trí ADC phải là số",
                "number.min": "Trọng số vị trí ADC không thể nhỏ hơn 0.5",
                "number.max": "Trọng số vị trí ADC không thể lớn hơn 1.5",
            }),
            Support: Joi.number().min(0.5).max(1.5).messages({
                "number.base": "Trọng số vị trí Support phải là số",
                "number.min": "Trọng số vị trí Support không thể nhỏ hơn 0.5",
                "number.max": "Trọng số vị trí Support không thể lớn hơn 1.5",
            }),
        }),
    }).unknown(true),
};

const getSeason = {
    params: Joi.object().keys({
        seasonId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID mùa giải phải là chuỗi",
            "any.required": "ID mùa giải là trường bắt buộc",
            "string.pattern.name": "ID mùa giải không hợp lệ",
        }),
    }),
};

const getSeasons = {
    query: Joi.object().keys({
        name: Joi.string().messages({
            "string.base": "Tên mùa giải phải là chuỗi",
        }),
        isActive: Joi.boolean().messages({
            "boolean.base": "Trạng thái hoạt động phải là boolean",
        }),
        startDate: Joi.string().custom(dateISO).messages({
            "string.base": "Ngày bắt đầu phải là chuỗi",
            "string.pattern.name": "Ngày bắt đầu không hợp lệ",
        }),
        endDate: Joi.string().custom(dateISO).messages({
            "string.base": "Ngày kết thúc phải là chuỗi",
            "string.pattern.name": "Ngày kết thúc không hợp lệ",
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
    }).unknown(true),
};

const endSeason = {
    params: Joi.object().keys({
        seasonId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID mùa giải phải là chuỗi",
            "any.required": "ID mùa giải là trường bắt buộc",
            "string.pattern.name": "ID mùa giải không hợp lệ",
        }),
    }),
};

module.exports = {
    createSeason,
    getSeasons,
    getSeason,
    updateSeason,
    updateSeasonSettings,
    endSeason,
};
