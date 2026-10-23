 const { z } = require("zod");

exports.createDoctorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),

  email: z.string().email("Invalid email address"),

  specialization: z
    .string()
    .min(2, "Specialization is required"),

  experience: z
    .number()
    .min(0, "Experience cannot be negative"),

  qualification: z
    .string()
    .min(2, "Qualification is required"),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits"),

  consultationFee: z
    .number()
    .min(0, "Consultation fee must be positive"),

  availableDays: z.array(z.string()),

  availableTime: z.object({
    start: z.string(),
    end: z.string(),
  }),
});