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
            // Zod v4 exposes validation failures on `issues`; older versions
            // used `errors`. Never let error formatting hide the real form
            // validation message behind an undefined `.map()` crash.
            const issues = Array.isArray(error.issues)
                ? error.issues
                : Array.isArray(error.errors)
                    ? error.errors
                    : [];
            const formattedErrors = issues.length
                ? issues.map(issue => {
                    const path = Array.isArray(issue.path) && issue.path.length
                        ? `${issue.path.join('.')}: `
                        : '';
                    return `${path}${issue.message || 'Invalid value'}`;
                }).join(', ')
                : 'Invalid request data';
            return next(new ApiError(400, `Validation Error: ${formattedErrors}`));
        }
        next(error);
    }
};

module.exports = { validate };
