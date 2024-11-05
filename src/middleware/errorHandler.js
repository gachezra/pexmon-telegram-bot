const winston = require('winston');

// Configuring Winston logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  defaultMeta: { service: 'telegram-bot' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log' }),
  ],
});

const handleError = (err, ctx) => {
  logger.error(err.message, { error: err });

  if (ctx && ctx.reply) {
    ctx.reply('An error occurred. Please try again later.');
  }
};

module.exports = handleError;