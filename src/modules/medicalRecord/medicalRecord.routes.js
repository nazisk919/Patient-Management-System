const router = require("express").Router();

const medicalRecordController = require("./medicalRecord.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
  createMedicalRecordSchema,
} = require("../../validators/medicalRecord.validator");

 
/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Create Medical Record
 *     tags: [Medical Records]
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
 *                 example: "6a3f8509ad7eeb763d1dac83"
 *               doctor:
 *                 type: string
 *                 example: "6a3f8726535d5cc527923469"
 *               diagnosis:
 *                 type: string
 *                 example: "Viral Fever"
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Fever", "Headache"]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Dust"]
 *               labReports:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Blood Test Normal"]
 *               treatment:
 *                 type: string
 *                 example: "Paracetamol 500mg"
 *               notes:
 *                 type: string
 *                 example: "Review after 5 days"
 *     responses:
 *       201:
 *         description: Medical Record Created Successfully
 */


router.post(
  "/",
  auth,
  role("DOCTOR", "ADMIN"),
  validate(createMedicalRecordSchema),
  medicalRecordController.createMedicalRecord
);

/**
 * @swagger
 * /api/medical-records:
 *   get:
 *     summary: Get All Medical Records
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Medical Records
 */
router.get(
  "/",
  auth,
  medicalRecordController.getAllMedicalRecords
);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   get:
 *     summary: Get Medical Record By ID
 *     tags: [Medical Records]
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
 *         description: Medical Record Details
 */
router.get(
  "/:id",
  auth,
  medicalRecordController.getMedicalRecordById
);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   put:
 *     summary: Update Medical Record
 *     tags: [Medical Records]
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
 *         description: Medical Record Updated Successfully
 */
router.put(
  "/:id",
  auth,
  role("DOCTOR", "ADMIN"),
  medicalRecordController.updateMedicalRecord
);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   delete:
 *     summary: Delete Medical Record
 *     tags: [Medical Records]
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
 *         description: Medical Record Deleted Successfully
 */
router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  medicalRecordController.deleteMedicalRecord
);

module.exports = router;