const mongoose = require("mongoose");

const billingItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      "CONSULTATION",
      "MEDICATION",
      "LAB_TEST",
      "ROOM_CHARGE",
      "PROCEDURE",
      "OTHER",
    ],
    default: "CONSULTATION",
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const billingSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    items: {
      type: [billingItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Invoice must have at least one billing item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
    },

    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },

    paidAt: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["UPI_ONLINE", "CARD_ONLINE", "NET_BANKING", "CASH"],
    },

    transactionId: {
      type: String,
      trim: true,
    },

    paymentDetails: {
      upiId: String,
      cardLast4: String,
      cardHolder: String,
      bankName: String,
      gatewayRef: String,
    },

    notes: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Billing", billingSchema);
