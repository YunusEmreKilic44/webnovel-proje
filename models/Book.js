const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Kitap başlığı zorunludur!"],
      trim: true,
      minlength: [2, "Başlık en az 3 karakter olmalıdır!"],
      maxlength: [80, "Başlık en az 80 karakter olmalıdır!"],
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Açıklama en fazla 2000 karakter olmalıdır!"],
    },
    coverImage: {
      type: String,
      default: "",
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Yazar zorunludur!"],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

bookSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Book", bookSchema);
