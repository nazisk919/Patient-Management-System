const router = require("express").Router();

const dashboardController = require("./dashboard.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard Statistics APIs
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get Dashboard Statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard Statistics Fetched Successfully
 */
router.get(
  "/stats",
  auth,
  role("ADMIN", "STAFF", "DOCTOR"),
  dashboardController.getDashboardStats
);

module.exports = router;