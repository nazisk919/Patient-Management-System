 const router = require("express").Router();

const prescriptionController = require("./prescription.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
  createPrescriptionSchema,
} = require("../../validators/prescription.validator");

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription Management APIs
 */

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create Prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment:
 *                 type: string
 *               patient:
 *                 type: string
 *               doctor:
 *                 type: string
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineName:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription Created Successfully
 */
router.post(
  "/",
  auth,
  role("DOCTOR", "ADMIN"),
  validate(createPrescriptionSchema),
  prescriptionController.createPrescription
);

 /**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Get All Prescriptions
 *     tags: [Prescriptions]
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
 *           example: fever
 *         description: Search by prescription notes
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
 *         description: List of Prescriptions
 */
router.get(
  "/",
  auth,
  prescriptionController.getAllPrescriptions
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get Prescription By ID
 *     tags: [Prescriptions]
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
 *         description: Prescription Details
 */
router.get(
  "/:id",
  auth,
  prescriptionController.getPrescriptionById
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Update Prescription
 *     tags: [Prescriptions]
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
 *         description: Prescription Updated Successfully
 */
router.put(
  "/:id",
  auth,
  role("DOCTOR", "ADMIN"),
  prescriptionController.updatePrescription
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   delete:
 *     summary: Delete Prescription
 *     tags: [Prescriptions]
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
 *         description: Prescription Deleted Successfully
 */
router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  prescriptionController.deletePrescription
);

module.exports = router;