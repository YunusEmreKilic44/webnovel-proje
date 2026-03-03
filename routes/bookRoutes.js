const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { verifyAccessToken } = require("../middlewares/auth");

router.get("/", bookController.getAllBooks);
router.get("/:bookId", bookController.getSingleBook);
router.post("/", verifyAccessToken, bookController.createBook);
router.put("/:bookId", verifyAccessToken, bookController.updateBook);
router.delete("/:bookId", verifyAccessToken, bookController.deleteBook);

module.exports = router;
