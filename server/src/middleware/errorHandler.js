const { ApiError } = require("../utils/ApiError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Log the error for observability
    logger.error(`[ErrorHandler] ${err.name || 'Error'}: ${err.message}`, err);

    // Map Zod Validation Errors
    if (err.name === 'ZodError') {
        const errors = Array.isArray(err.errors) ? err.errors.map(e => ({
            field: e.path ? e.path.join('.') : 'unknown',
            message: e.message
        })) : [];
        error = new ApiError(400, "Validation Error", errors, err.stack);
    }
    // Map Prisma Client Errors
    else if (err.constructor && err.constructor.name === 'PrismaClientKnownRequestError') {
        let statusCode = 400;
        let message = err.message;
        let errors = [];

        switch (err.code) {
            case 'P2002': // Unique constraint violation
                statusCode = 409;
                const fields = err.meta?.target || [];
                message = `A record with this ${fields.join(', ')} already exists.`;
                break;
            case 'P2003': // Foreign key constraint violation
                statusCode = 400;
                message = `Foreign key constraint failed. The referenced entity does not exist.`;
                break;
            case 'P2025': // Record not found
                statusCode = 404;
                message = err.meta?.cause || "Record not found";
                break;
            default:
                message = `Database operation failed: ${err.message}`;
        }
        error = new ApiError(statusCode, message, errors, err.stack);
    } else if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode ? error.statusCode : 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: error.success,
        message: error.message,
        ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
    };

    return res.status(error.statusCode || 500).json(response);
};

module.exports = { errorHandler };
