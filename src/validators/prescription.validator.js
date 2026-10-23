const { z } = require("zod");

const medicineSchema = z.object({
  medicineName: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
});
 const createPrescriptionSchema = z.object({
  appointment: z.string(),

  patient: z.string(),

  doctor: z.string(),

  medicines: z.array(medicineSchema),

  notes: z.string().optional(),
});
module.exports = {
  createPrescriptionSchema,
};