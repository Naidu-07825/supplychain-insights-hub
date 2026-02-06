const mongoose = require("mongoose");

const deliveryAddressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    enum: ["Home", "Work", "Other"],
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  altPhone: {
    type: String,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    // 👤 User Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 📧 Email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // 🔑 Password (hashed)
    password: {
      type: String,
      required: true,
    },

    // 📱 Phone Number
    phone: {
      type: String,
      trim: true,
    },

    // 🎭 Role-based access
    role: {
      type: String,
      enum: ["admin", "hospital"],
      default: "hospital",
    },

    // ✅ Email verification status
    isVerified: {
      type: Boolean,
      default: false,
    },

    // 🚦 Account status (NEW)
    status: {
      type: String,
      enum: ["approved", "blocked"],
      default: "approved",
    },

    // 🔐 OTP for email verification
    otp: {
      type: String,
    },

    otpExpires: {
      type: Date,
    },

    // 📍 Delivery Addresses (NEW)
    deliveryAddresses: [deliveryAddressSchema],

    // 📍 Preferred Address ID (NEW)
    preferredAddressId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Calculate profile completion percentage
userSchema.methods.getProfileCompletion = function () {
  const fields = {
    name: Boolean(this.name),
    email: Boolean(this.email),
    phone: Boolean(this.phone),
    deliveryAddress: this.deliveryAddresses && this.deliveryAddresses.length > 0,
  };

  const completedFields = Object.values(fields).filter(Boolean).length;
  const totalFields = Object.keys(fields).length;

  return {
    percentage: Math.round((completedFields / totalFields) * 100),
    completedFields,
    totalFields,
    missingFields: Object.keys(fields).filter((key) => !fields[key]),
  };
};

module.exports = mongoose.model("User", userSchema);
