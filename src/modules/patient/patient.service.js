const Patient = require("./patient.model");
const ApiError = require("../../utils/ApiError");

// ===============================
// Create Patient
// ===============================
const createPatient = async (body, userId) => {
  const patient = await Patient.create({
    ...body,
    createdBy: userId,
  });

  return patient;
};

// ===============================
// Get All Patients
// ===============================
 const APIFeatures = require("../../utils/apiFeatures");

 const getAllPatients = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const features = new APIFeatures(
    Patient.find(),
    query
  )
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate();

  const patients = await features.query;

  const totalRecords = await Patient.countDocuments();

  return {
    totalRecords,
    currentPage: page,
    totalPages: Math.ceil(totalRecords / limit),
    limit,
    data: patients,
  };
};
// ===============================
// Get Patient By ID
// ===============================
const getPatientById = async (id) => {
  const patient = await Patient.findById(id).populate(
    "createdBy",
    "name email role"
  );

  if (!patient) {
    throw new ApiError(404, "Patient Not Found");
  }

  return patient;
};

// ===============================
// Update Patient
// ===============================
const updatePatient = async (id, body) => {
  const patient = await Patient.findByIdAndUpdate(
    id,
    body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!patient) {
    throw new ApiError(404, "Patient Not Found");
  }

  return patient;
};

// ===============================
// Delete Patient
// ===============================
const deletePatient = async (id) => {
  const patient = await Patient.findByIdAndDelete(id);

  if (!patient) {
    throw new ApiError(404, "Patient Not Found");
  }

  return patient;
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};