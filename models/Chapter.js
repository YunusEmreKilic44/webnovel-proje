const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Bolum basligi zorunludur!"],
      trim: true,
      minlength: [1, "Bolum basligi en az 2 karakter olmalidir!"],
      maxlength: [120, "Bolum basligi en fazla 120 karakter olmalidir!"],
    },

    content: {
      type: String,
      required: [true, "Bolum icerigi zorunludur!"],
      minlength: [20, "Bolum icerigi en az 20 karakter olmalidir!"],
      maxlength: [3000, "Bolum icerigi en fazla 3000 karakter olmalidir!"],
    },
    number: {
      type: Number,
      required: [true, "Bolum numarasi zorunludur!"],
      min: [0, "Bolum numarasi 1'den kucuk olamaz!"],
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Kitap zorunludur!"],
    },
  },
  { timestamps: true },
);

chapterSchema.index({ book: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("Chapter", chapterSchema);
