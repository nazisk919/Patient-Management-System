const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const Doctor = require("../modules/doctor/doctor.model");

const sampleDoctors = [
  {
    name: "Dr. Aisha Verma",
    email: "aisha.verma@carepulse.com",
    specialization: "Neurologist",
    experience: 12,
    qualification: "MBBS, DM (Neurology)",
    phone: "9811223344",
    consultationFee: 1200,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: { start: "10:00 AM", end: "04:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Robert Chase",
    email: "chase.neuro@carepulse.com",
    specialization: "Neurologist",
    experience: 9,
    qualification: "MD (Neurology), FACP",
    phone: "9811223355",
    consultationFee: 1100,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTime: { start: "11:00 AM", end: "05:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Ananya Iyer",
    email: "ananya.iyer@carepulse.com",
    specialization: "Cardiologist",
    experience: 14,
    qualification: "MBBS, DM (Cardiology)",
    phone: "9822334455",
    consultationFee: 1000,
    availableDays: ["Monday", "Tuesday", "Thursday"],
    availableTime: { start: "09:30 AM", end: "03:30 PM" },
    isActive: true,
  },
  {
    name: "Dr. Priya Kapoor",
    email: "priya.kapoor@carepulse.com",
    specialization: "Dermatologist",
    experience: 8,
    qualification: "MBBS, MD (Dermatology)",
    phone: "9833445566",
    consultationFee: 700,
    availableDays: ["Monday", "Wednesday", "Saturday"],
    availableTime: { start: "10:00 AM", end: "02:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Vikram Malhotra",
    email: "vikram.malhotra@carepulse.com",
    specialization: "Pediatrician",
    experience: 11,
    qualification: "MBBS, MD (Pediatrics)",
    phone: "9844556677",
    consultationFee: 600,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
    availableTime: { start: "09:00 AM", end: "01:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Arvind Mehta",
    email: "arvind.mehta@carepulse.com",
    specialization: "Orthopedic",
    experience: 15,
    qualification: "MBBS, MS (Orthopedics)",
    phone: "9855667788",
    consultationFee: 900,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTime: { start: "10:30 AM", end: "04:30 PM" },
    isActive: true,
  },
  {
    name: "Dr. Sunita Rao",
    email: "sunita.rao@carepulse.com",
    specialization: "Gynecologist",
    experience: 13,
    qualification: "MBBS, MS (OBG)",
    phone: "9866778899",
    consultationFee: 750,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: { start: "10:00 AM", end: "03:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Kabir Sen",
    email: "kabir.sen@carepulse.com",
    specialization: "Psychiatrist",
    experience: 9,
    qualification: "MBBS, MD (Psychiatry)",
    phone: "9877889900",
    consultationFee: 1100,
    availableDays: ["Monday", "Thursday", "Saturday"],
    availableTime: { start: "02:00 PM", end: "07:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Gregory House",
    email: "gregory.house@carepulse.com",
    specialization: "General Physician",
    experience: 18,
    qualification: "MD, FACP (Internal Medicine)",
    phone: "9888990011",
    consultationFee: 850,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: { start: "09:00 AM", end: "05:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Meera Nambiar",
    email: "meera.nambiar@carepulse.com",
    specialization: "Oncologist",
    experience: 16,
    qualification: "MBBS, DM (Medical Oncology)",
    phone: "9899001122",
    consultationFee: 1500,
    availableDays: ["Wednesday", "Friday", "Saturday"],
    availableTime: { start: "10:00 AM", end: "04:00 PM" },
    isActive: true,
  },
  {
    name: "Dr. Rohan Joshi",
    email: "rohan.joshi@carepulse.com",
    specialization: "ENT Specialist",
    experience: 10,
    qualification: "MBBS, MS (ENT)",
    phone: "9800112233",
    consultationFee: 650,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTime: { start: "11:00 AM", end: "03:30 PM" },
    isActive: true,
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : "mongodb://127.0.0.1:27017/patient_management";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding doctors...");

    for (const doc of sampleDoctors) {
      const existing = await Doctor.findOne({ email: doc.email });
      if (!existing) {
        await Doctor.create(doc);
        console.log(`+ Added: ${doc.name} (${doc.specialization})`);
      } else {
        console.log(`= Already exists: ${doc.name}`);
      }
    }

    console.log("Doctor seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
