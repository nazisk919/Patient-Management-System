const router = require("express").Router();
const billingController = require("./billing.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

// Require authentication for all billing routes
router.use(auth);

// Get Billing Analytics / Stats
router.get("/stats", billingController.getBillingStats);

// List All Bills (accessible to all authenticated users)
router.get("/", billingController.getAllBills);

// Create New Bill (Admin, Staff, Doctor)
router.post(
  "/",
  role("ADMIN", "STAFF", "DOCTOR"),
  billingController.createBill
);

// Get Specific Bill
router.get("/:id", billingController.getBillById);

// Pay Bill Online (Patient, Admin, Staff, Doctor)
router.post("/:id/pay", billingController.payBill);

// Delete Bill (Admin only)
router.delete("/:id", role("ADMIN"), billingController.deleteBill);

module.exports = router;
