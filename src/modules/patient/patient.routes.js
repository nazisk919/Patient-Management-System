 const router = require("express").Router();

const patientController = require("./patient.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
  createPatientSchema,
} = require("../../validators/patient.validator");

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient Management APIs
 */

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create Patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               gender:
 *                 type: string
 *                 example: MALE
 *               dob:
 *                 type: string
 *                 example: "1998-05-20"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               address:
 *                 type: string
 *                 example: Delhi
 *               bloodGroup:
 *                 type: string
 *                 example: O+
 *               height:
 *                 type: number
 *                 example: 175
 *               weight:
 *                 type: number
 *                 example: 70
 *               emergencyContact:
 *                 type: string
 *                 example: "9876543211"
 *     responses:
 *       201:
 *         description: Patient Created Successfully
 */
 router.post(
  "/",
  auth,
  role("ADMIN", "STAFF", "DOCTOR"),
  validate(createPatientSchema),
  patientController.createPatient
);
/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get All Patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient List
 */
router.get(
  "/",
  auth,
  patientController.getAllPatients
);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get Patient By ID
 *     tags: [Patients]
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
 *         description: Patient Details
 */
router.get(
  "/:id",
  auth,
  patientController.getPatientById
);

 /**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get All Patients
 *     tags: [Patients]
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
 *           example: john
 *         description: Search by patient name
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
 *         description: Patient List
 */
router.put(
  "/:id",
  auth,
  role("ADMIN", "STAFF", "DOCTOR"),
  patientController.updatePatient
);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete Patient
 *     tags: [Patients]
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
 *         description: Patient Deleted Successfully
 */
router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  patientController.deletePatient
);

module.exports = router;