const ApiError = require("../utils/ApiError");

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    error = new ApiError(400, message);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    error = new ApiError(409, `${field} already exists`);
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(
      error.statusCode || 500,
      error.message || "Internal Server Error"
    );
  }

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  });
};

module.exports = errorMiddleware;