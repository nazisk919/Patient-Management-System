const router = require("express").Router();

const doctorController = require("./doctor.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
  createDoctorSchema,
} = require("../../validators/doctor.validator");

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor Management APIs
 */

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create Doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Raj Sharma
 *               email:
 *                 type: string
 *                 example: raj@gmail.com
 *               specialization:
 *                 type: string
 *                 example: Cardiologist
 *               experience:
 *                 type: number
 *                 example: 10
 *               qualification:
 *                 type: string
 *                 example: MBBS, MD
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               consultationFee:
 *                 type: number
 *                 example: 800
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Monday
 *                   - Tuesday
 *                   - Friday
 *               availableTime:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     example: "10:00"
 *                   end:
 *                     type: string
 *                     example: "05:00 PM"
 *     responses:
 *       201:
 *         description: Doctor Created Successfully
 */
router.post(
  "/",
  auth,
  role("ADMIN"),
  validate(createDoctorSchema),
  doctorController.createDoctor
);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get All Doctors
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctors List
 */
router.get(
  "/",
  auth,
  doctorController.getAllDoctors
);

 /**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get All Doctors
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
 *           example: Raj
 *         description: Search by doctor name or specialization
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: -createdAt
 *         description: Sort by field
 *
 *     responses:
 *       200:
 *         description: Doctors List
 */
router.get(
  "/:id",
  auth,
  doctorController.getDoctorById
);

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Update Doctor
 *     tags: [Doctors]
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
 *         description: Doctor Updated Successfully
 */
router.put(
  "/:id",
  auth,
  role("ADMIN"),
  doctorController.updateDoctor
);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete Doctor
 *     tags: [Doctors]
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
 *         description: Doctor Deleted Successfully
 */
router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  doctorController.deleteDoctor
);

module.exports = router;