const MedicalRecord = require("./medicalRecord.model");
const Patient = require("../patient/patient.model");
const Doctor = require("../doctor/doctor.model");

const ApiError = require("../../utils/ApiError");

// ===============================
// Create Medical Record
// ===============================
const createMedicalRecord = async (body) => {
  const {
    patient,
    doctor,
    diagnosis,
    symptoms,
    treatment,
    allergies,
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

  // Create Medical Record
  const medicalRecord = await MedicalRecord.create({
    patient,
    doctor,
    diagnosis,
    symptoms,
    treatment,
    allergies,
    notes,
  });

  return medicalRecord;
};

// ===============================
// Get All Medical Records
// ===============================
const getAllMedicalRecords = async () => {
  return await MedicalRecord.find()
    .populate("patient")
    .populate("doctor")
    .sort({ createdAt: -1 });
};

// ===============================
// Get Medical Record By ID
// ===============================
const getMedicalRecordById = async (id) => {
  const medicalRecord = await MedicalRecord.findById(id)
    .populate("patient")
    .populate("doctor");

  if (!medicalRecord) {
    throw new ApiError(404, "Medical Record Not Found");
  }

  return medicalRecord;
};

// ===============================
// Update Medical Record
// ===============================
const updateMedicalRecord = async (id, body) => {
  const medicalRecord = await MedicalRecord.findByIdAndUpdate(
    id,
    body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!medicalRecord) {
    throw new ApiError(404, "Medical Record Not Found");
  }

  return medicalRecord;
};

// ===============================
// Delete Medical Record
// ===============================
const deleteMedicalRecord = async (id) => {
  const medicalRecord = await MedicalRecord.findByIdAndDelete(id);

  if (!medicalRecord) {
    throw new ApiError(404, "Medical Record Not Found");
  }
};

module.exports = {
  createMedicalRecord,
  getAllMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};