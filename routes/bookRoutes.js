const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { verifyAccessToken } = require("../middlewares/auth");
const { uploadBookCover } = require("../middlewares/upload");
const {
  validateObjectIdParam,
  validateCreateBook,
  validateUpdateBook,
} = require("../middlewares/validators");

router.get("/", bookController.getAllBooks);
router.get("/:bookId", validateObjectIdParam("bookId"), bookController.getSingleBook);
router.post(
  "/",
  verifyAccessToken,
  uploadBookCover,
  validateCreateBook,
  bookController.createBook,
);
router.put(
  "/:bookId",
  verifyAccessToken,
  uploadBookCover,
  validateObjectIdParam("bookId"),
  validateUpdateBook,
  bookController.updateBook,
);
router.delete(
  "/:bookId",
  verifyAccessToken,
  validateObjectIdParam("bookId"),
  bookController.deleteBook,
);

module.exports = router;
