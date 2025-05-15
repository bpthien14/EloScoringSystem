// src/config/index.js
const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Schema validation cho biến môi trường
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
    DEFAULT_ELO: Joi.number().default(1000),
    K_FACTOR_NEW: Joi.number().default(32),
    K_FACTOR_REGULAR: Joi.number().default(24),
    K_FACTOR_EXPERIENCED: Joi.number().default(16),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
    LOG_LEVEL: Joi.string().default('info')
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  elo: {
    defaultElo: envVars.DEFAULT_ELO,
    kFactors: {
      new: envVars.K_FACTOR_NEW,
      regular: envVars.K_FACTOR_REGULAR,
      experienced: envVars.K_FACTOR_EXPERIENCED
    }
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  logs: {
    level: envVars.LOG_LEVEL
  }
};