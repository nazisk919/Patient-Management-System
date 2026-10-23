const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../modules/auth/auth.model");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Access Token Required"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to ensure live role and active status
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError(401, "User Not Found"));
    }

    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(new ApiError(401, "Invalid Token"));
  }
};

module.exports = auth;