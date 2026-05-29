const { ApiError } = require("../utils/ApiError");

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return next(new ApiError(400, "Validation failed", errors));
        }

        next();
    };
};

const sanitizeInput = (req, res, next) => {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            return value.trim()
                .replace(/[<>]/g, '')
                .substring(0, 10000);
        }
        return value;
    };

    const sanitizeObject = (obj) => {
        if (obj && typeof obj === 'object') {
            for (let key in obj) {
                if (Array.isArray(obj[key])) {
                    obj[key] = obj[key].map(item =>
                        typeof item === 'object' ? sanitizeObject(item) : sanitizeValue(item)
                    );
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    obj[key] = sanitizeObject(obj[key]);
                } else {
                    obj[key] = sanitizeValue(obj[key]);
                }
            }
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
        return next(new ApiError(400, "Page must be greater than 0"));
    }

    if (limit < 1 || limit > 100) {
        return next(new ApiError(400, "Limit must be between 1 and 100"));
    }

    req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit
    };

    next();
};

const validateIdParam = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id || isNaN(parseInt(id))) {
            return next(new ApiError(400, `Invalid ${paramName} parameter`));
        }

        req.params[paramName] = parseInt(id);
        next();
    };
};

module.exports = {
    validateRequest,
    sanitizeInput,
    validatePagination,
    validateIdParam
};
