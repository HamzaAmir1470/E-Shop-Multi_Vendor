const ErrorHandler = require("../utils/ErrorHandler");
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong Mongoose Object ID Error
    if (err.name === "CastError") {
        const message = `Resource not found with this ID..... Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }
    // Duplicate Key error
    if (err.code === 11000) {
        const message = `Duplicate Key ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }
    // wrong jwt error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, please try again later`;
        err = new ErrorHandler(message, 400);
    }
    // jwt expired
    if(err.name === "TokenExpiredError") {
        const message = `Json Web Token is expired, please try again later`;
        err = new ErrorHandler(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
}