const express = require("express");
const router = express.Router({ mergeParams: true });

const commentController = require("../controllers/commentController");
const { verifyAccessToken } = require("../middlewares/auth");
const {
  validateObjectIdParam,
  validateCreateComment,
  validateUpdateComment,
} = require("../middlewares/validators");

router.get("/", validateObjectIdParam("bookId"), commentController.getAllComments);
router.get(
  "/:commentId",
  validateObjectIdParam("bookId"),
  validateObjectIdParam("commentId"),
  commentController.getSingleComment,
);
router.post(
  "/",
  verifyAccessToken,
  validateCreateComment,
  commentController.createComment,
);
router.put(
  "/:commentId",
  verifyAccessToken,
  validateUpdateComment,
  commentController.updateComment,
);
router.delete(
  "/:commentId",
  verifyAccessToken,
  validateObjectIdParam("bookId"),
  validateObjectIdParam("commentId"),
  commentController.deleteComment,
);

module.exports = router;
