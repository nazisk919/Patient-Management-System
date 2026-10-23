const patientService = require("./patient.service");

const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// ===============================
// Create Patient
// ===============================
exports.createPatient = catchAsync(async (req, res) => {
  const patient = await patientService.createPatient(
    req.body,
    req.user.id
  );

  res.status(201).json(
    new ApiResponse(
      201,
      "Patient Created Successfully",
      patient
    )
  );
});

// ===============================
// Get All Patients
// ===============================
exports.getAllPatients = catchAsync(async (req, res) => {
 const patients =
  await patientService.getAllPatients(req.query);

  res.status(200).json(
    new ApiResponse(
      200,
      "Patients Fetched Successfully",
      patients
    )
  );
});

// ===============================
// Get Patient By ID
// ===============================
exports.getPatientById = catchAsync(async (req, res) => {
  const patient = await patientService.getPatientById(
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Patient Fetched Successfully",
      patient
    )
  );
});

// ===============================
// Update Patient
// ===============================
exports.updatePatient = catchAsync(async (req, res) => {
  const patient = await patientService.updatePatient(
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Patient Updated Successfully",
      patient
    )
  );
});

// ===============================
// Delete Patient
// ===============================
exports.deletePatient = catchAsync(async (req, res) => {
  await patientService.deletePatient(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Patient Deleted Successfully"
    )
  );
});