 const router = require("express").Router();

const authController = require("./auth.controller");

const validate = require("../../middlewares/validate.middleware");
const auth = require("../../middlewares/auth.middleware");

const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} = require("../../validators/auth.validator");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register User
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nazis Khan
 *               email:
 *                 type: string
 *                 example: nazis@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: PATIENT
 *     responses:
 *       201:
 *         description: User Registered Successfully
 */
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: nazis@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login Successful
 */
router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: nazis@gmail.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 */
router.post(
  "/forgot-password",
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset Password
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Password Reset Successfully
 */
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get Logged In User Profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User Profile
 */
router.get(
  "/profile",
  auth,
  authController.profile
);

module.exports = router;