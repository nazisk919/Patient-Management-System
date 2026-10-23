const Doctor = require("./doctor.model");
const ApiError = require("../../utils/ApiError");
const ApiFeatures = require("../../utils/ApiFeatures");

// ===============================
// Create Doctor
// ===============================
const createDoctor = async (body) => {
  const existingDoctor = await Doctor.findOne({
    email: body.email,
  });

  if (existingDoctor) {
    throw new ApiError(409, "Doctor already exists");
  }

  const doctor = await Doctor.create(body);

  return doctor;
};

// ===============================
// Get All Doctors
// ===============================
const getAllDoctors = async (query) => {
  const features = new ApiFeatures(
    Doctor.find(),
    query
  )
    .search(["name", "specialization", "qualification"])
    .filter()
    .sort()
    .paginate();

  const doctors = await features.query;

  return doctors;
};
// ===============================
// Get Doctor By ID
// ===============================
const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id);

  if (!doctor) {
    throw new ApiError(404, "Doctor Not Found");
  }

  return doctor;
};

// ===============================
// Update Doctor
// ===============================
const updateDoctor = async (id, body) => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!doctor) {
    throw new ApiError(404, "Doctor Not Found");
  }

  return doctor;
};

// ===============================
// Delete Doctor
// ===============================
const deleteDoctor = async (id) => {
  const doctor = await Doctor.findByIdAndDelete(id);

  if (!doctor) {
    throw new ApiError(404, "Doctor Not Found");
  }

  return doctor;
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};