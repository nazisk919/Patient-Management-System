 const { z } = require("zod");

const createPatientSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dob: z.string(),
  phone: z.string().min(10),
  address: z.string().min(5),
  bloodGroup: z.enum([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ]),
  height: z.number().optional(),
  weight: z.number().optional(),
  emergencyContact: z.string().min(10),
});

module.exports = {
  createPatientSchema,
};