const isProduction = process.env.NODE_ENV === 'production';

const logger = {
    info: (...args) => {
        if (!isProduction) {
            console.log('[INFO]', new Date().toISOString(), ...args);
        }
    },

    warn: (...args) => {
        console.warn('[WARN]', new Date().toISOString(), ...args);
    },

    error: (...args) => {
        console.error('[ERROR]', new Date().toISOString(), ...args);
    },

    debug: (...args) => {
        if (!isProduction) {
            console.log('[DEBUG]', new Date().toISOString(), ...args);
        }
    },

    http: (req, res, duration) => {
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

        if (res.statusCode >= 500) {
            logger.error(message);
        } else if (res.statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.info(message);
        }
    }
};

module.exports = logger;
