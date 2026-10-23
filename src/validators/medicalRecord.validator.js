const { z } = require("zod");

const createMedicalRecordSchema = z.object({
  body: z.object({
    patient: z.string(),

    doctor: z.string(),

    diagnosis: z.string().min(3),

    symptoms: z.array(z.string()),

    treatment: z.string().min(3),

    allergies: z.array(z.string()).optional(),

    notes: z.string().optional(),
  }),
});

module.exports = {
  createMedicalRecordSchema,
};