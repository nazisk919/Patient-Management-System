const dashboardService = require("./dashboard.service");
const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// ===============================
// Get Dashboard Statistics
// ===============================
exports.getDashboardStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();

  res.status(200).json(
    new ApiResponse(
      200,
      "Dashboard Statistics Fetched Successfully",
      stats
    )
  );
});