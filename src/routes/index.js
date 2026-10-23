 const router = require("express").Router();
 
 const dashboardRoutes = require("../modules/dashboard/dashboard.routes");

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health Check API
 *     responses:
 *       200:
 *         description: API Running Successfully
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Patient Management System API Base Route",
    docs: "/api-docs",
    health: "/api/health"
  });
});

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Patient Management API Running Successfully",
  });
});

// Authentication Routes
router.use("/auth", require("../modules/auth/auth.routes"));

// Patient Routes
router.use("/patients", require("../modules/patient/patient.routes"));

// Doctor Routes
router.use("/doctors", require("../modules/doctor/doctor.routes"));

// Appointment Routes

router.use("/appointments", require("../modules/appointment/appointment.routes"));

//Prescription Routes

router.use(
  "/prescriptions",
  require("../modules/prescription/prescription.routes")
);

// MwdicalRecord Routes

router.use(
  "/medical-records",
  require("../modules/medicalRecord/medicalRecord.routes")
);

// Dashboard
router.use("/dashboard", dashboardRoutes);

// Billing & Online Payments
router.use("/billing", require("../modules/billing/billing.routes"));



module.exports = router;