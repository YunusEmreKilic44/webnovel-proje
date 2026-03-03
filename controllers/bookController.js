const { default: mongoose } = require("mongoose");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const Comment = require("../models/Comment");

const getAuthUserId = (req) => req.user?._id || req.user?.id;

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("author");

    return res
      .status(200)
      .json({ success: true, count: books.length, data: books });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId).populate("author").lean();

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadi!" });
    }

    const chapters = await Chapter.find({ book: bookId })
      .sort({ number: 1 })
      .lean();

    const comments = await Comment.find({ book: bookId })
      .populate("author")
      .sort({ createdAt: -1 })
      .lean();

    return res
      .status(200)
      .json({ success: true, data: { book, chapters, comments } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const { bookId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Giris gerekli.",
      });
    }

    const { title, description, coverImage } = req.body;
    const updatedPayload = {};

    if (title && title.trim()) updatedPayload.title = title;
    if (description && description.trim()) {
      updatedPayload.description = description;
    }
    if (coverImage && coverImage.trim()) updatedPayload.coverImage = coverImage;

    if (!Object.keys(updatedPayload).length) {
      return res.status(400).json({
        success: false,
        message: "Guncellenecek en az bir alan gondermelisiniz",
      });
    }

    const book = await Book.findById(bookId).select("author");

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadi" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = book.author.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Bu kitabi guncelleme yetkiniz yok!",
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedPayload, {
      new: true,
      runValidators: true,
    }).populate("author");

    return res.status(200).json({ success: true, data: updatedBook });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Giris gerekli.",
      });
    }

    const book = await Book.create({
      title,
      description,
      coverImage,
      author: userId,
    });

    return res.status(201).json({ success: true, data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Giris gerekli.",
      });
    }

    const book = await Book.findById(bookId).select("author");

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadi" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = book.author.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Bu kitabi silme yetkiniz yok!",
      });
    }

    await Book.findByIdAndDelete(bookId);
    await Chapter.deleteMany({ book: bookId });
    await Comment.deleteMany({ book: bookId });

    return res.status(200).json({
      success: true,
      message: "Kitap ve bagli bolumler silindi!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBooks,
  getSingleBook,
  updateBook,
  createBook,
  deleteBook,
};
