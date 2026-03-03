const mongoose = require("mongoose");
const Book = require("../models/Book");
const Comment = require("../models/Comment");

const getAllComments = async (req, res) => {
  try {
    const { bookId } = req.params;
    const isBookExist = await Book.exists({ _id: bookId });

    if (!isBookExist) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    const comments = await Comment.find({ book: bookId })
      .populate("user")
      .populate("book");
    return res.status(200).json({ success: true, data: comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleComment = async (req, res) => {
  try {
    const { bookId, commentId } = req.params;

    const isBookExist = await Book.exists({ _id: bookId });

    if (!isBookExist) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    const comment = await Comment.findOne({ _id: commentId, book: bookId })
      .populate("book")
      .populate("user");

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Yorum bulunamadı" });
    }
    return res.status(200).json({ success: true, data: comment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { content } = req.body;
    const userId = req.user._id || req.user.id;
    const isBookExist = await Book.exists({ _id: bookId });

    if (!isBookExist) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    const comment = await Comment.create({
      book: bookId,
      user: userId,
      content: content,
    });

    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { commentId, bookId } = req.params;
    const { content } = req.body;

    if (
      !mongoose.isValidObjectId(commentId) ||
      !mongoose.isValidObjectId(bookId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Geçersiz bookId veya commentId" });
    }

    const isBookExist = await Book.exists({ _id: bookId });
    if (!isBookExist) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    // yorum gerçekten bu kitaba ait mi + owner kontrolü
    const comment = await Comment.findOne({
      _id: commentId,
      book: bookId,
    }).select("user");
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Yorum bulunamadı" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = comment.user.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ success: false, message: "Bu işlem için yetkiniz yok!" });
    }

    const updatedPayload = {};
    if (content && String(content).trim())
      updatedPayload.content = String(content).trim();

    if (!Object.keys(updatedPayload).length) {
      return res.status(400).json({
        success: false,
        message: "Güncellenecek en az bir alan göndermelisiniz",
      });
    }

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId, book: bookId },
      updatedPayload,
      { new: true, runValidators: true },
    );

    if (!updatedComment) {
      return res
        .status(404)
        .json({ success: false, message: "Yorum bulunamadı" });
    }

    return res.status(200).json({ success: true, data: updatedComment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { bookId, commentId } = req.params;
    const userId = req.user._id || req.user.id;

    if (
      !mongoose.isValidObjectId(bookId) ||
      !mongoose.isValidObjectId(commentId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Geçersiz bookId veya commentId" });
    }

    const isBookExist = await Book.exists({ _id: bookId });
    if (!isBookExist) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      book: bookId,
    }).select("user");
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Yorum bulunamadı" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = comment.user.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ success: false, message: "Bu işlem için yetkiniz yok!" });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res
        .status(404)
        .json({ success: false, message: "Yorum bulunamadı" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Yorumunuz başarıyla silindi." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllComments,
  getSingleComment,
  updateComment,
  createComment,
  deleteComment,
};
