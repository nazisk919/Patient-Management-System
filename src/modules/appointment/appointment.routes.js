const router = require("express").Router();

const appointmentController = require("./appointment.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
  createAppointmentSchema,
} = require("../../validators/appointment.validator");

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment Management APIs
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create Appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient:
 *                 type: string
 *               doctor:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 example: "2026-07-15"
 *               appointmentTime:
 *                 type: string
 *                 example: "10:30 AM"
 *               reason:
 *                 type: string
 *                 example: Fever and headache
 *               notes:
 *                 type: string
 *                 example: First visit
 *     responses:
 *       201:
 *         description: Appointment Created Successfully
 */
router.post(
  "/",
  auth,
  role("ADMIN", "STAFF", "DOCTOR", "PATIENT"),
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

 /**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get All Appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page Number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: Fever
 *         description: Search by appointment reason or time
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: -appointmentDate
 *         description: Sort by field
 *
 *     responses:
 *       200:
 *         description: Appointment List
 */
router.get(
  "/",
  auth,
  appointmentController.getAllAppointments
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get Appointment By ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment Details
 */
router.get(
  "/:id",
  auth,
  appointmentController.getAppointmentById
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update Appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment Updated Successfully
 */
router.put(
  "/:id",
  auth,
  role("ADMIN", "STAFF"),
  appointmentController.updateAppointment
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete Appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment Deleted Successfully
 */
router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  appointmentController.deleteAppointment
);

module.exports = router;