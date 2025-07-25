class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.explanation = message; // Explanation of the error
    }
}

module.exports = AppError;