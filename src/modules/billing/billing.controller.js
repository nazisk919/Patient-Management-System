const billingService = require("./billing.service");
const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// Create Bill
exports.createBill = catchAsync(async (req, res) => {
  const result = await billingService.createBill(req.body, req.user?.id);
  res.status(201).json(new ApiResponse(201, "Invoice Created Successfully", result));
});

// Get All Bills
exports.getAllBills = catchAsync(async (req, res) => {
  const result = await billingService.getAllBills(req.query);
  res.status(200).json(new ApiResponse(200, "Bills Fetched Successfully", result));
});

// Get Bill By ID
exports.getBillById = catchAsync(async (req, res) => {
  const result = await billingService.getBillById(req.params.id);
  res.status(200).json(new ApiResponse(200, "Bill Fetched Successfully", result));
});

// Process Online Payment
exports.payBill = catchAsync(async (req, res) => {
  const result = await billingService.payBill(req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, "Payment Processed Successfully", result));
});

// Get Billing Stats
exports.getBillingStats = catchAsync(async (req, res) => {
  const result = await billingService.getBillingStats();
  res.status(200).json(new ApiResponse(200, "Billing Stats Fetched Successfully", result));
});

// Delete Bill
exports.deleteBill = catchAsync(async (req, res) => {
  const result = await billingService.deleteBill(req.params.id);
  res.status(200).json(new ApiResponse(200, result.message, null));
});
