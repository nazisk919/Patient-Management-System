const appointmentService = require("./appointment.service");

const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

// ===============================
// Create Appointment
// ===============================
exports.createAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.createAppointment(
    req.body,
    req.user.id
  );

  res.status(201).json(
    new ApiResponse(
      201,
      "Appointment Created Successfully",
      appointment
    )
  );
});

// ===============================
// Get All Appointments
// ===============================
exports.getAllAppointments = catchAsync(async (req, res) => {
  const appointments = await appointmentService.getAllAppointments(req.query);

  res.status(200).json(
    new ApiResponse(
      200,
      "Appointments Fetched Successfully",
      appointments
    )
  );
});

// ===============================
// Get Appointment By ID
// ===============================
exports.getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Appointment Fetched Successfully",
      appointment
    )
  );
});

// ===============================
// Update Appointment
// ===============================
exports.updateAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.updateAppointment(
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Appointment Updated Successfully",
      appointment
    )
  );
});

// ===============================
// Delete Appointment
// ===============================
exports.deleteAppointment = catchAsync(async (req, res) => {
  await appointmentService.deleteAppointment(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Appointment Deleted Successfully"
    )
  );
});