const Patient = require("../patient/patient.model");
const Doctor = require("../doctor/doctor.model");
const Appointment = require("../appointment/appointment.model");
const Prescription = require("../prescription/prescription.model");
const Billing = require("../billing/billing.model");

const getDashboardStats = async () => {
  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalPrescriptions,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
    paidBills,
    pendingBills,
  ] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Prescription.countDocuments(),
    Appointment.countDocuments({ status: "PENDING" }),
    Appointment.countDocuments({ status: "COMPLETED" }),
    Appointment.countDocuments({ status: "CANCELLED" }),
    Billing.find({ status: "PAID" }),
    Billing.find({ status: "PENDING" }),
  ]);

  const totalRevenue = paidBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const pendingBillsAmount = pendingBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalPrescriptions,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
    totalRevenue,
    pendingBillsCount: pendingBills.length,
    pendingBillsAmount,
  };
};

module.exports = {
  getDashboardStats,
};