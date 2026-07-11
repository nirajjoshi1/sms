const { ApiError } = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
    try {
        // We parse body, query, and params if defined in the schema
        if (schema.body) {
            req.body = schema.body.parse(req.body);
        }
        if (schema.query) {
            req.query = schema.query.parse(req.query);
        }
        if (schema.params) {
            req.params = schema.params.parse(req.params);
        }
        next();
    } catch (error) {
        // If ZodError
        if (error.name === 'ZodError') {
            const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            return next(new ApiError(400, `Validation Error: ${formattedErrors}`));
        }
        next(error);
    }
};

module.exports = { validate };
