const ApiFeatures = require("../../utils/ApiFeatures");
const Appointment = require("./appointment.model");
const Patient = require("../patient/patient.model");
const Doctor = require("../doctor/doctor.model");
const ApiError = require("../../utils/ApiError");

// ===============================
// Create Appointment
// ===============================
const createAppointment = async (body, userId) => {
  const {
    patient,
    doctor,
    appointmentDate,
    appointmentTime,
    reason,
    notes,
  } = body;

  // Check Patient
  const patientExists = await Patient.findById(patient);

  if (!patientExists) {
    throw new ApiError(404, "Patient Not Found");
  }

  // Check Doctor
  const doctorExists = await Doctor.findById(doctor);

  if (!doctorExists) {
    throw new ApiError(404, "Doctor Not Found");
  }

  // Check Duplicate Appointment
  const existingAppointment = await Appointment.findOne({
    doctor,
    appointmentDate,
    appointmentTime,
    status: {
      $ne: "CANCELLED",
    },
  });

  if (existingAppointment) {
    throw new ApiError(
      409,
      "Doctor already has an appointment at this time"
    );
  }

  // Create Appointment
  const appointment = await Appointment.create({
    patient,
    doctor,
    appointmentDate,
    appointmentTime,
    reason,
    notes,
    createdBy: userId,
  });

  return appointment;
} 
  
// ===============================
// Get All Appointments
// ===============================
 const getAllAppointments = async (query) => {
  const features = new ApiFeatures(
    Appointment.find()
      .populate("patient", "firstName lastName phone")
      .populate("doctor", "name specialization"),
    query
  )
    .search(["reason", "appointmentTime"])
    .filter()
    .sort()
    .paginate();

  const appointments = await features.query;

  return appointments;
};
// ===============================
// Get Appointment By ID
// ===============================
const getAppointmentById = async (id) => {
  const appointment = await Appointment.findById(id)
    .populate("patient")
    .populate("doctor");

  if (!appointment) {
    throw new ApiError(404, "Appointment Not Found");
  }

  return appointment;
};

// ===============================
// Update Appointment
// ===============================
const updateAppointment = async (id, body) => {
  const appointment = await Appointment.findByIdAndUpdate(
    id,
    body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!appointment) {
    throw new ApiError(404, "Appointment Not Found");
  }

  return appointment;
};

// ===============================
// Delete Appointment
// ===============================
const deleteAppointment = async (id) => {
  const appointment = await Appointment.findByIdAndDelete(id);

  if (!appointment) {
    throw new ApiError(404, "Appointment Not Found");
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};