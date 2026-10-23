 const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

   password: {
  type: String,
  required: true,
  minlength: 6,
  select: false,
},

resetPasswordToken: {
  type: String,
},

resetPasswordExpire: {
  type: Date,
},

    role: {
      type: String,
      enum: ["ADMIN", "STAFF", "DOCTOR", "PATIENT"],
      default: "PATIENT",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
authSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  // Avoid double-hashing if password is already a bcrypt hash
  if (
    typeof this.password === "string" &&
    (this.password.startsWith("$2a$") ||
      this.password.startsWith("$2b$") ||
      this.password.startsWith("$2y$"))
  ) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
authSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;

  // Check if password in database is a bcrypt hash
  const isBcrypt =
    typeof this.password === "string" &&
    (this.password.startsWith("$2a$") ||
      this.password.startsWith("$2b$") ||
      this.password.startsWith("$2y$"));

  if (isBcrypt) {
    return bcrypt.compare(password, this.password);
  }

  // Fallback for unhashed / legacy passwords (e.g. manually inserted in DB)
  if (this.password === password) {
    // Automatically upgrade to bcrypt hash
    this.password = password;
    await this.save();
    return true;
  }

  return false;
};

module.exports = mongoose.model("User", authSchema);