// src/validations/match.validation.js
const Joi = require("joi");
const { objectId, dateISO } = require("./custom.validation");

const createMatch = {
    body: Joi.object()
        .keys({
            seasonId: Joi.string().required().custom(objectId).messages({
                "string.base": "ID mùa giải phải là chuỗi",
                "any.required": "ID mùa giải là trường bắt buộc",
                "string.pattern.name": "ID mùa giải không hợp lệ",
            }),
            matchDate: Joi.string().custom(dateISO).required().messages({
                "string.base": "Ngày thi đấu phải là chuỗi",
                "any.required": "Ngày thi đấu là trường bắt buộc",
                "string.pattern.name": "Ngày thi đấu không hợp lệ",
            }),
            team1: Joi.object()
                .keys({
                    players: Joi.array()
                        .items(
                            Joi.object().keys({
                                playerId: Joi.string()
                                    .required()
                                    .custom(objectId)
                                    .messages({
                                        "string.base":
                                            "ID người chơi phải là chuỗi",
                                        "any.required":
                                            "ID người chơi là trường bắt buộc",
                                        "string.pattern.name":
                                            "ID người chơi không hợp lệ",
                                    }),
                                position: Joi.string()
                                    .valid(
                                        "Top",
                                        "Jungle",
                                        "Mid",
                                        "ADC",
                                        "Support"
                                    )
                                    .required()
                                    .messages({
                                        "string.base":
                                            "Vị trí thi đấu phải là chuỗi",
                                        "any.required":
                                            "Vị trí thi đấu là trường bắt buộc",
                                        "any.only":
                                            "Vị trí thi đấu không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                                    }),
                                performance: Joi.number()
                                    .min(0)
                                    .max(10)
                                    .messages({
                                        "number.base":
                                            "Chỉ số hiệu suất phải là số",
                                        "number.min":
                                            "Chỉ số hiệu suất không thể âm",
                                        "number.max":
                                            "Chỉ số hiệu suất không thể lớn hơn 10",
                                    }),
                            })
                        )
                        .length(5)
                        .required()
                        .messages({
                            "array.base":
                                "Danh sách người chơi phải là một mảng",
                            "any.required":
                                "Danh sách người chơi là trường bắt buộc",
                            "array.length":
                                "Đội hình phải có đúng 5 người chơi",
                        }),
                })
                .required(),
            team2: Joi.object()
                .keys({
                    players: Joi.array()
                        .items(
                            Joi.object().keys({
                                playerId: Joi.string()
                                    .required()
                                    .custom(objectId)
                                    .messages({
                                        "string.base":
                                            "ID người chơi phải là chuỗi",
                                        "any.required":
                                            "ID người chơi là trường bắt buộc",
                                        "string.pattern.name":
                                            "ID người chơi không hợp lệ",
                                    }),
                                position: Joi.string()
                                    .valid(
                                        "Top",
                                        "Jungle",
                                        "Mid",
                                        "ADC",
                                        "Support"
                                    )
                                    .required()
                                    .messages({
                                        "string.base":
                                            "Vị trí thi đấu phải là chuỗi",
                                        "any.required":
                                            "Vị trí thi đấu là trường bắt buộc",
                                        "any.only":
                                            "Vị trí thi đấu không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                                    }),
                                performance: Joi.number()
                                    .min(0)
                                    .max(10)
                                    .messages({
                                        "number.base":
                                            "Chỉ số hiệu suất phải là số",
                                        "number.min":
                                            "Chỉ số hiệu suất không thể âm",
                                        "number.max":
                                            "Chỉ số hiệu suất không thể lớn hơn 10",
                                    }),
                            })
                        )
                        .length(5)
                        .required()
                        .messages({
                            "array.base":
                                "Danh sách người chơi phải là một mảng",
                            "any.required":
                                "Danh sách người chơi là trường bắt buộc",
                            "array.length":
                                "Đội hình phải có đúng 5 người chơi",
                        }),
                })
                .required(),
            result: Joi.object()
                .keys({
                    winner: Joi.number().valid(1, 2).required().messages({
                        "number.base": "Đội thắng phải là số",
                        "any.required": "Đội thắng là trường bắt buộc",
                        "any.only": "Đội thắng phải là 1 hoặc 2",
                    }),
                    score: Joi.object()
                        .keys({
                            team1: Joi.number()
                                .integer()
                                .min(0)
                                .required()
                                .messages({
                                    "number.base": "Điểm số đội 1 phải là số",
                                    "any.required":
                                        "Điểm số đội 1 là trường bắt buộc",
                                    "number.integer":
                                        "Điểm số đội 1 phải là số nguyên",
                                    "number.min": "Điểm số đội 1 không thể âm",
                                }),
                            team2: Joi.number()
                                .integer()
                                .min(0)
                                .required()
                                .messages({
                                    "number.base": "Điểm số đội 2 phải là số",
                                    "any.required":
                                        "Điểm số đội 2 là trường bắt buộc",
                                    "number.integer":
                                        "Điểm số đội 2 phải là số nguyên",
                                    "number.min": "Điểm số đội 2 không thể âm",
                                }),
                        })
                        .required(),
                })
                .required(),
            notes: Joi.string().messages({
                "string.base": "Ghi chú phải là chuỗi",
            }),
            penalties: Joi.array().items(
                Joi.object().keys({
                    playerId: Joi.string().required().custom(objectId).messages({
                        "string.base": "ID người chơi phải là chuỗi",
                        "any.required": "ID người chơi là trường bắt buộc",
                        "string.pattern.name": "ID người chơi không hợp lệ",
                    }),
                    reason: Joi.string().required().messages({
                        "string.base": "Lý do phạt phải là chuỗi",
                        "any.required": "Lý do phạt là trường bắt buộc",
                    }),
                    points: Joi.number().required().messages({
                        "number.base": "Điểm phạt phải là số",
                        "any.required": "Điểm phạt là trường bắt buộc",
                    }),
                })
            ),
        })
        .unknown(true),
};

const getMatches = {
    query: Joi.object()
        .keys({
            seasonId: Joi.string().custom(objectId).messages({
                "string.base": "ID mùa giải phải là chuỗi",
                "string.pattern.name": "ID mùa giải không hợp lệ",
            }),
            playerId: Joi.string().custom(objectId).messages({
                "string.base": "ID người chơi phải là chuỗi",
                "string.pattern.name": "ID người chơi không hợp lệ",
            }),
            fromDate: Joi.string().custom(dateISO).messages({
                "string.base": "Ngày bắt đầu phải là chuỗi",
                "string.pattern.name": "Ngày bắt đầu không hợp lệ",
            }),
            toDate: Joi.string().custom(dateISO).messages({
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
        })
        .unknown(true),
};

const getMatch = {
    params: Joi.object().keys({
        matchId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID trận đấu phải là chuỗi",
            "any.required": "ID trận đấu là trường bắt buộc",
            "string.pattern.name": "ID trận đấu không hợp lệ",
        }),
    }),
};

const updateMatch = {
    params: Joi.object().keys({
        matchId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID trận đấu phải là chuỗi",
            "any.required": "ID trận đấu là trường bắt buộc",
            "string.pattern.name": "ID trận đấu không hợp lệ",
        }),
    }),
    body: Joi.object()
        .keys({
            matchDate: Joi.string().custom(dateISO).messages({
                "string.base": "Ngày thi đấu phải là chuỗi",
                "string.pattern.name": "Ngày thi đấu không hợp lệ",
            }),
            "team1.players": Joi.array()
                .items(
                    Joi.object().keys({
                        playerId: Joi.string()
                            .required()
                            .custom(objectId)
                            .messages({
                                "string.base": "ID người chơi phải là chuỗi",
                                "any.required":
                                    "ID người chơi là trường bắt buộc",
                                "string.pattern.name":
                                    "ID người chơi không hợp lệ",
                            }),
                        position: Joi.string()
                            .valid("Top", "Jungle", "Mid", "ADC", "Support")
                            .required()
                            .messages({
                                "string.base": "Vị trí thi đấu phải là chuỗi",
                                "any.required":
                                    "Vị trí thi đấu là trường bắt buộc",
                                "any.only":
                                    "Vị trí thi đấu không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                            }),
                        performance: Joi.number().min(0).max(10).messages({
                            "number.base": "Chỉ số hiệu suất phải là số",
                            "number.min": "Chỉ số hiệu suất không thể âm",
                            "number.max":
                                "Chỉ số hiệu suất không thể lớn hơn 10",
                        }),
                    })
                )
                .length(5)
                .messages({
                    "array.base": "Danh sách người chơi phải là một mảng",
                    "array.length": "Đội hình phải có đúng 5 người chơi",
                }),
            "team2.players": Joi.array()
                .items(
                    Joi.object().keys({
                        playerId: Joi.string()
                            .required()
                            .custom(objectId)
                            .messages({
                                "string.base": "ID người chơi phải là chuỗi",
                                "any.required":
                                    "ID người chơi là trường bắt buộc",
                                "string.pattern.name":
                                    "ID người chơi không hợp lệ",
                            }),
                        position: Joi.string()
                            .valid("Top", "Jungle", "Mid", "ADC", "Support")
                            .required()
                            .messages({
                                "string.base": "Vị trí thi đấu phải là chuỗi",
                                "any.required":
                                    "Vị trí thi đấu là trường bắt buộc",
                                "any.only":
                                    "Vị trí thi đấu không hợp lệ, phải là một trong: Top, Jungle, Mid, ADC, Support",
                            }),
                        performance: Joi.number().min(0).max(10).messages({
                            "number.base": "Chỉ số hiệu suất phải là số",
                            "number.min": "Chỉ số hiệu suất không thể âm",
                            "number.max":
                                "Chỉ số hiệu suất không thể lớn hơn 10",
                        }),
                    })
                )
                .length(5)
                .messages({
                    "array.base": "Danh sách người chơi phải là một mảng",
                    "array.length": "Đội hình phải có đúng 5 người chơi",
                }),
            "result.winner": Joi.number().valid(1, 2).messages({
                "number.base": "Đội thắng phải là số",
                "any.only": "Đội thắng phải là 1 hoặc 2",
            }),
            "result.score.team1": Joi.number().integer().min(0).messages({
                "number.base": "Điểm số đội 1 phải là số",
                "number.integer": "Điểm số đội 1 phải là số nguyên",
                "number.min": "Điểm số đội 1 không thể âm",
            }),
            "result.score.team2": Joi.number().integer().min(0).messages({
                "number.base": "Điểm số đội 2 phải là số",
                "number.integer": "Điểm số đội 2 phải là số nguyên",
                "number.min": "Điểm số đội 2 không thể âm",
            }),
            notes: Joi.string().messages({
                "string.base": "Ghi chú phải là chuỗi",
            }),
            penalties: Joi.array().items(
                Joi.object().keys({
                    playerId: Joi.string().required().custom(objectId).messages({
                        "string.base": "ID người chơi phải là chuỗi",
                        "any.required": "ID người chơi là trường bắt buộc",
                        "string.pattern.name": "ID người chơi không hợp lệ",
                    }),
                    reason: Joi.string().required().messages({
                        "string.base": "Lý do phạt phải là chuỗi",
                        "any.required": "Lý do phạt là trường bắt buộc",
                    }),
                    points: Joi.number().required().messages({
                        "number.base": "Điểm phạt phải là số",
                        "any.required": "Điểm phạt là trường bắt buộc",
                    }),
                })
            ),
        })
        .unknown(true),
};

const deleteMatch = {
    params: Joi.object().keys({
        matchId: Joi.string().required().custom(objectId).messages({
            "string.base": "ID trận đấu phải là chuỗi",
            "any.required": "ID trận đấu là trường bắt buộc",
            "string.pattern.name": "ID trận đấu không hợp lệ",
        }),
    }),
};

module.exports = {
    createMatch,
    getMatches,
    getMatch,
    updateMatch,
    deleteMatch,
};
