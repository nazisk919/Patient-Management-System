 const prescriptionService = require("./prescription.service");

const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// ===============================
// Create Prescription
// ===============================
exports.createPrescription = catchAsync(async (req, res) => {
  const prescription =
    await prescriptionService.createPrescription(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Prescription Created Successfully",
      prescription
    )
  );
});

// ===============================
// Get All Prescriptions
// ===============================
exports.getAllPrescriptions = catchAsync(async (req, res) => {
  const prescriptions =
    await prescriptionService.getAllPrescriptions(req.query);

  res.status(200).json(
    new ApiResponse(
      200,
      "Prescriptions Fetched Successfully",
      prescriptions
    )
  );
});

// ===============================
// Get Prescription By ID
// ===============================
exports.getPrescriptionById = catchAsync(async (req, res) => {
  const prescription =
    await prescriptionService.getPrescriptionById(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Prescription Fetched Successfully",
      prescription
    )
  );
});

// ===============================
// Update Prescription
// ===============================
exports.updatePrescription = catchAsync(async (req, res) => {
  const prescription =
    await prescriptionService.updatePrescription(
      req.params.id,
      req.body
    );

  res.status(200).json(
    new ApiResponse(
      200,
      "Prescription Updated Successfully",
      prescription
    )
  );
});

// ===============================
// Delete Prescription
// ===============================
exports.deletePrescription = catchAsync(async (req, res) => {
  await prescriptionService.deletePrescription(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Prescription Deleted Successfully"
    )
  );
});