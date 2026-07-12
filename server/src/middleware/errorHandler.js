const { ApiError } = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Map Prisma Client Errors
    if (err.constructor && err.constructor.name === 'PrismaClientKnownRequestError') {
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

    return res.status(error.statusCode).json(response);
};

module.exports = { errorHandler };
