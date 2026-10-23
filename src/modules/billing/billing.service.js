const crypto = require("crypto");
const Billing = require("./billing.model");
const Patient = require("../patient/patient.model");
const ApiError = require("../../utils/ApiError");

const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Billing.countDocuments();
  const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `INV-${currentYear}-${String(count + 1).padStart(4, "0")}-${randomSuffix}`;
};

// ===============================
// Create Bill
// ===============================
const createBill = async (body, userId) => {
  const {
    patient,
    doctor,
    appointment,
    items,
    tax = 0,
    discount = 0,
    dueDate,
    notes = "",
  } = body;

  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    throw new ApiError(404, "Patient not found");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "At least one billing item is required");
  }

  // Calculate item totals & subtotal
  const processedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    return {
      description: item.description,
      category: item.category || "CONSULTATION",
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    };
  });

  const subtotal = processedItems.reduce((acc, item) => acc + item.total, 0);
  const taxAmount = Number(tax) || 0;
  const discountAmount = Number(discount) || 0;
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  const invoiceNumber = await generateInvoiceNumber();

  const bill = await Billing.create({
    invoiceNumber,
    patient,
    doctor: doctor || undefined,
    appointment: appointment || undefined,
    items: processedItems,
    subtotal,
    tax: taxAmount,
    discount: discountAmount,
    totalAmount,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    notes,
    createdBy: userId,
  });

  return await Billing.findById(bill._id)
    .populate("patient", "firstName lastName phone email bloodGroup address")
    .populate("doctor", "name specialization consultationFee")
    .populate("appointment", "appointmentDate appointmentTime reason status");
};

// ===============================
// Get All Bills
// ===============================
const getAllBills = async (query = {}) => {
  const filter = {};

  if (query.status && query.status !== "ALL") {
    filter.status = query.status;
  }

  if (query.patient) {
    filter.patient = query.patient;
  }

  if (query.doctor) {
    filter.doctor = query.doctor;
  }

  let bills = await Billing.find(filter)
    .populate("patient", "firstName lastName phone email bloodGroup address")
    .populate("doctor", "name specialization consultationFee")
    .populate("appointment", "appointmentDate appointmentTime reason status")
    .sort({ createdAt: -1 });

  // Optional in-memory search for invoiceNumber or patient name
  if (query.search && query.search.trim()) {
    const term = query.search.trim().toLowerCase();
    bills = bills.filter((b) => {
      const invMatch = b.invoiceNumber?.toLowerCase().includes(term);
      const nameMatch = `${b.patient?.firstName || ""} ${b.patient?.lastName || ""}`
        .toLowerCase()
        .includes(term);
      const phoneMatch = b.patient?.phone?.includes(term);
      return invMatch || nameMatch || phoneMatch;
    });
  }

  return bills;
};

// ===============================
// Get Bill By ID
// ===============================
const getBillById = async (id) => {
  const bill = await Billing.findById(id)
    .populate("patient", "firstName lastName phone email bloodGroup address")
    .populate("doctor", "name specialization consultationFee")
    .populate("appointment", "appointmentDate appointmentTime reason status")
    .populate("createdBy", "name role");

  if (!bill) {
    throw new ApiError(404, "Bill / Invoice not found");
  }

  return bill;
};

// ===============================
// Pay Bill Online
// ===============================
const payBill = async (id, paymentData, user) => {
  const bill = await Billing.findById(id);

  if (!bill) {
    throw new ApiError(404, "Bill / Invoice not found");
  }

  if (bill.status === "PAID") {
    throw new ApiError(400, "This invoice has already been paid");
  }

  const { paymentMethod, upiId, cardLast4, cardHolder, bankName } = paymentData;

  const validMethods = ["UPI_ONLINE", "CARD_ONLINE", "NET_BANKING", "CASH"];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    throw new ApiError(400, "Valid payment method is required");
  }

  const txnPrefix = paymentMethod.split("_")[0];
  const randomTxnId = `TXN_${txnPrefix}_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  bill.status = "PAID";
  bill.paidAt = new Date();
  bill.paymentMethod = paymentMethod;
  bill.transactionId = randomTxnId;
  bill.paymentDetails = {
    upiId: upiId || undefined,
    cardLast4: cardLast4 || undefined,
    cardHolder: cardHolder || undefined,
    bankName: bankName || undefined,
    gatewayRef: "CAREPULSE_GATEWAY_SUCCESS",
  };

  await bill.save();

  return await Billing.findById(bill._id)
    .populate("patient", "firstName lastName phone email bloodGroup address")
    .populate("doctor", "name specialization consultationFee")
    .populate("appointment", "appointmentDate appointmentTime reason status");
};

// ===============================
// Get Billing Analytics / Stats
// ===============================
const getBillingStats = async () => {
  const [paidBills, pendingBills, totalCount] = await Promise.all([
    Billing.find({ status: "PAID" }),
    Billing.find({ status: "PENDING" }),
    Billing.countDocuments(),
  ]);

  const totalRevenue = paidBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const pendingAmount = pendingBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  return {
    totalRevenue,
    pendingAmount,
    totalInvoices: totalCount,
    paidCount: paidBills.length,
    pendingCount: pendingBills.length,
  };
};

// ===============================
// Delete Bill
// ===============================
const deleteBill = async (id) => {
  const bill = await Billing.findById(id);
  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  await Billing.findByIdAndDelete(id);
  return { message: "Bill deleted successfully" };
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  payBill,
  getBillingStats,
  deleteBill,
};
