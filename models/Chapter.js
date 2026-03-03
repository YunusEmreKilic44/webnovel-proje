const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Bölüm başlığı zorunludur!"],
      trim: true,
      minlength: [1, "Bölüm başlığı en az 2 karakter olmalıdır!"],
      maxlength: [120, "Bölüm başlığı en fazla 120 karakter olmalıdır!"],
    },

    content: {
      type: String,
      required: [true, "Bölüm içeriği zorunludur!"],
      minlength: [20, "Bölüm içeriği en az 20 karakter olmalıdır!"],
      maxlength: [3000, "Bölüm içeriği en fazla 3000 karakter olmalıdır!"],
    },
    number: {
      type: Number,
      required: [true, "Bölüm numarası zorunludur!"],
      min: [0, "Bölüm numarası 1'den küçük olamaz!"],
      unique: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Kitap zorunludur!"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chapter", chapterSchema);
