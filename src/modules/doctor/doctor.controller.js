const doctorService = require("./doctor.service");

const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// ===============================
// Create Doctor
// ===============================
exports.createDoctor = catchAsync(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Doctor Created Successfully",
      doctor
    )
  );
});

// ===============================
// Get All Doctors
// ===============================
exports.getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await doctorService.getAllDoctors(req.query);

  res.status(200).json(
    new ApiResponse(
      200,
      "Doctors Fetched Successfully",
      doctors
    )
  );
});

// ===============================
// Get Doctor By ID
// ===============================
exports.getDoctorById = catchAsync(async (req, res) => {
  const doctor = await doctorService.getDoctorById(
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Doctor Fetched Successfully",
      doctor
    )
  );
});

// ===============================
// Update Doctor
// ===============================
exports.updateDoctor = catchAsync(async (req, res) => {
  const doctor = await doctorService.updateDoctor(
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Doctor Updated Successfully",
      doctor
    )
  );
});

// ===============================
// Delete Doctor
// ===============================
exports.deleteDoctor = catchAsync(async (req, res) => {
  await doctorService.deleteDoctor(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Doctor Deleted Successfully"
    )
  );
});