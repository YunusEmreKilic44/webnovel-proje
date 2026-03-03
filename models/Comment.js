const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Kitap zorunludur!"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Kullanıcı zorunludur!"],
    },
    content: {
      type: String,
      required: [true, "Yorum içeriği zorunludur!"],
      minlength: [1, "Yorum alanı boş olamaz!"],
      maxlength: [2000, "Yorum en fazla 2000 karakter olmalıdır!"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
