const authService = require("./auth.service");
const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// ===============================
// Register User
// ===============================
exports.register = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res.status(201).json(
    new ApiResponse(201, "User Registered Successfully", result)
  );
});

// ===============================
// Login User
// ===============================
exports.login = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);

  res.status(200).json(
    new ApiResponse(200, "Login Successful", result)
  );
});

// ===============================
// Get Logged In User Profile
// ===============================
exports.profile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Profile Fetched Successfully", user)
  );
});

// ===============================
// Forgot Password
// ===============================
exports.forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(
    req.body.email
  );

  res.status(200).json(
    new ApiResponse(
      200,
      result.message
    )
  );
});

// ===============================
// Reset Password
// ===============================
exports.resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(
    req.params.token,
    req.body.password
  );

  res.status(200).json(
    new ApiResponse(
      200,
      result.message
    )
  );
});