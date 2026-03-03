const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Kullanici adi zorunludur!"],
      trim: true,
      minlength: [3, "Kullanici adi en az 3 karakter olmalidir!"],
      maxlength: [30, "Kullanici adi en fazla 30 karakter olmalidir!"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email zorunludur!"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Sifre zorunludur!"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
