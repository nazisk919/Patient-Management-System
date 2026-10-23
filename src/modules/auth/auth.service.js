const crypto = require("crypto");
const sendEmail = require("./auth.email");
const User = require("./auth.model");
const ApiError = require("../../utils/ApiError");
const generateToken = require("../../utils/generateToken");

// ===============================
// Register User
// ===============================
const registerUser = async (body) => {
  const { name, email, password, role } = body;

  // Check Existing User
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Generate JWT Token
  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

// ===============================
// Login User
// ===============================
const loginUser = async (body) => {
  const { email, password } = body;

  // Find User
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid Email or Password");
  }

  // Compare Password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid Email or Password");
  }

  // Generate Token
  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  // Hide Password
  user.password = undefined;

  return {
    user,
    token,
  };
};

// ===============================
// Get Logged In User Profile
// ===============================
const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  return user;
};

// ===============================
// Forgot Password
// ===============================
const forgotPassword = async (email) => {
  // Check User
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  // Generate Reset Token
  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

  // Save Hashed Token
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token Expiry (10 Minutes)
  user.resetPasswordExpire =
    Date.now() + 10 * 60 * 1000;

  await user.save({
    validateBeforeSave: false,
  });

  // Reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Email HTML
  const message = `
    <h2>Password Reset</h2>
    <p>Click the button below to reset your password.</p>

    <a href="${resetUrl}">
      Reset Password
    </a>

    <p>This link will expire in 10 minutes.</p>
  `;

  // Send Email
  await sendEmail({
    email: user.email,
    subject: "Reset Password",
    message,
  });

  return {
    message:
      "Password reset link sent successfully",
  };
};


// ===============================
// Reset Password
// ===============================
const resetPassword = async (token, password) => {
  // Hash Token
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find User
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  }).select("+password");

  if (!user) {
    throw new ApiError(
      400,
      "Invalid or Expired Reset Token"
    );
  }

  // Update Password
  user.password = password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return {
    message: "Password Reset Successfully",
  };
};

 module.exports = {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
   resetPassword,
};