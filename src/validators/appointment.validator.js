 const { z } = require("zod");

const createAppointmentSchema = z.object({
  patient: z
    .string()
    .min(1, "Patient ID is required"),

  doctor: z
    .string()
    .min(1, "Doctor ID is required"),

  appointmentDate: z
    .string()
    .min(1, "Appointment Date is required"),

  appointmentTime: z
    .string()
    .min(1, "Appointment Time is required"),

  reason: z
    .string()
    .min(3, "Reason must be at least 3 characters"),

  notes: z.string().optional(),
});

module.exports = {
  createAppointmentSchema,
};