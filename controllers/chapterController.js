const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const mongoose = require("mongoose");
const getAllChapters = async (req, res) => {
  try {
    const { bookId } = req.params;

    const bookExists = await Book.exists({ _id: bookId });

    if (!bookExists) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    const chapters = await Chapter.find({ book: bookId }).sort({ number: 1 });

    return res
      .status(200)
      .json({ success: true, count: chapters.length, data: chapters });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleChapter = async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;

    const bookExists = await Book.exists({ _id: bookId });
    if (!bookExists) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    const chapter = await Chapter.findOne({ _id: chapterId, book: bookId });
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Bölüm bulunamadı" });
    }

    return res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createChapter = async (req, res) => {
  try {
    const { title, content, number } = req.body;
    const userId = req.user?._id || req.user?.id;
    const { bookId } = req.params;

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz bookId",
      });
    }

    if (!title || !content || number === undefined || number === null) {
      return res.status(400).json({
        success: false,
        message: "title, content ve number zorunludur",
      });
    }

    const book = await Book.findById(bookId).select("author");
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Kitap bulunamadı",
      });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = book.author.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Bu kitaba bölüm ekleme yetkiniz yok",
      });
    }

    const createdChapter = await Chapter.create({
      title: String(title).trim(),
      content: String(content),
      number,
      book: bookId,
    });

    return res.status(201).json({ success: true, data: createdChapter });
  } catch (error) {
    // duplicate key (aynı kitapta aynı number varsa) için daha anlamlı mesaj
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bu kitapta bu bölüm numarası zaten var",
      });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateChapter = async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const userId = req.user?._id || req.user?.id;

    // 1) id doğrulama
    if (
      !mongoose.isValidObjectId(bookId) ||
      !mongoose.isValidObjectId(chapterId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz bookId veya chapterId",
      });
    }

    // 2) kitap var mı + owner/admin mi?
    const book = await Book.findById(bookId).select("author");
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Kitap bulunamadı",
      });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = book.author.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Bu kitabın bölümünü güncelleme yetkiniz yok",
      });
    }

    // 3) payload hazırla
    const { title, content, number } = req.body;
    const updatedPayload = {};

    if (title && title.trim()) updatedPayload.title = title.trim();
    if (content && content.trim()) updatedPayload.content = content.trim();

    // number güncellemesi: 0 kontrolü bozulmasın diye undefined/null check
    if (number !== undefined && number !== null) {
      updatedPayload.number = Number(number);
    }

    if (!Object.keys(updatedPayload).length) {
      return res.status(400).json({
        success: false,
        message: "Güncellenecek en az bir alan göndermelisiniz",
      });
    }

    // 4) bölüm bu kitaba ait mi? + update
    const updatedChapter = await Chapter.findOneAndUpdate(
      { _id: chapterId, book: bookId },
      updatedPayload,
      { new: true, runValidators: true },
    );

    if (!updatedChapter) {
      return res.status(404).json({
        success: false,
        message: "Bölüm bulunamadı",
      });
    }

    return res.status(200).json({ success: true, data: updatedChapter });
  } catch (error) {
    // aynı kitapta aynı number varsa (unique index) buraya düşebilir
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bu kitapta bu bölüm numarası zaten var",
      });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (
      !mongoose.isValidObjectId(bookId) ||
      !mongoose.isValidObjectId(chapterId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz bookId veya chapterId",
      });
    }

    // 1) Bölüm bu kitaba ait mi?
    const chapter = await Chapter.findOne({
      _id: chapterId,
      book: bookId,
    }).select("_id book");
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Bölüm bulunamadı",
      });
    }

    // 2) Yetki kontrolü için kitabın author'ını al
    const book = await Book.findById(bookId).select("author");
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Kitap bulunamadı",
      });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = book.author.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Bu bölümü silme yetkiniz yok!",
      });
    }

    // 3) Sil
    const result = await Chapter.deleteOne({ _id: chapterId, book: bookId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Bölüm zaten silinmiş veya bulunamadı",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bölüm başarıyla silindi",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllChapters,
  getSingleChapter,
  updateChapter,
  createChapter,
  deleteChapter,
};
