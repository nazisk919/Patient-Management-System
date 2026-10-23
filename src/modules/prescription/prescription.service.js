const ApiFeatures = require("../../utils/ApiFeatures");
const Prescription = require("./prescription.model");
const Appointment = require("../appointment/appointment.model");
const Patient = require("../patient/patient.model");
const Doctor = require("../doctor/doctor.model");

const ApiError = require("../../utils/ApiError");

// ===============================
// Create Prescription
// ===============================
const createPrescription = async (body) => {
  const {
    appointment,
    patient,
    doctor,
    medicines,
    notes,
  } = body;

  // Check Appointment
  const appointmentExists = await Appointment.findById(
    appointment
  );

  if (!appointmentExists) {
    throw new ApiError(404, "Appointment Not Found");
  }

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

  // Prevent Duplicate Prescription
  const existingPrescription =
    await Prescription.findOne({
      appointment,
    });

  if (existingPrescription) {
    throw new ApiError(
      409,
      "Prescription already exists for this appointment"
    );
  }

  const prescription =
    await Prescription.create({
      appointment,
      patient,
      doctor,
      medicines,
      notes,
    });

  return prescription;
};

// ===============================
// Get All Prescriptions
// ===============================
 const getAllPrescriptions = async (query) => {
  const features = new ApiFeatures(
    Prescription.find()
      .populate(
        "appointment",
        "appointmentDate appointmentTime status"
      )
      .populate(
        "patient",
        "firstName lastName phone"
      )
      .populate(
        "doctor",
        "name specialization"
      ),
    query
  )
    .search(["notes"])
    .filter()
    .sort()
    .paginate();

  const prescriptions = await features.query;

  return prescriptions;
};
// ===============================
// Get Prescription By ID
// ===============================
const getPrescriptionById = async (id) => {
  const prescription =
    await Prescription.findById(id)
      .populate("appointment")
      .populate("patient")
      .populate("doctor");

  if (!prescription) {
    throw new ApiError(
      404,
      "Prescription Not Found"
    );
  }

  return prescription;
};

// ===============================
// Update Prescription
// ===============================
const updatePrescription = async (
  id,
  body
) => {
  const prescription =
    await Prescription.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!prescription) {
    throw new ApiError(
      404,
      "Prescription Not Found"
    );
  }

  return prescription;
};

// ===============================
// Delete Prescription
// ===============================
const deletePrescription = async (
  id
) => {
  const prescription =
    await Prescription.findByIdAndDelete(id);

  if (!prescription) {
    throw new ApiError(
      404,
      "Prescription Not Found"
    );
  }
};

module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};