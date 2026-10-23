const medicalRecordService = require("./medicalRecord.service");

const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// ===============================
// Create Medical Record
// ===============================
exports.createMedicalRecord = catchAsync(async (req, res) => {
  const medicalRecord =
    await medicalRecordService.createMedicalRecord(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Medical Record Created Successfully",
      medicalRecord
    )
  );
});

// ===============================
// Get All Medical Records
// ===============================
exports.getAllMedicalRecords = catchAsync(async (req, res) => {
  const medicalRecords =
    await medicalRecordService.getAllMedicalRecords();

  res.status(200).json(
    new ApiResponse(
      200,
      "Medical Records Fetched Successfully",
      medicalRecords
    )
  );
});

// ===============================
// Get Medical Record By ID
// ===============================
exports.getMedicalRecordById = catchAsync(async (req, res) => {
  const medicalRecord =
    await medicalRecordService.getMedicalRecordById(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Medical Record Fetched Successfully",
      medicalRecord
    )
  );
});

// ===============================
// Update Medical Record
// ===============================
exports.updateMedicalRecord = catchAsync(async (req, res) => {
  const medicalRecord =
    await medicalRecordService.updateMedicalRecord(
      req.params.id,
      req.body
    );

  res.status(200).json(
    new ApiResponse(
      200,
      "Medical Record Updated Successfully",
      medicalRecord
    )
  );
});

// ===============================
// Delete Medical Record
// ===============================
exports.deleteMedicalRecord = catchAsync(async (req, res) => {
  await medicalRecordService.deleteMedicalRecord(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Medical Record Deleted Successfully"
    )
  );
});