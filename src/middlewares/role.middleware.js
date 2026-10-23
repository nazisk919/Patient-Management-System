const ApiError = require("../utils/ApiError");

const role = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access Denied"));
    }

    next();
  };
};

module.exports = role;