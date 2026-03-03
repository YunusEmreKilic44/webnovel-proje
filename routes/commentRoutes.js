const express = require("express");
const router = express.Router();

const commentController = require("../controllers/commentController");
const { verifyAccessToken } = require("../middlewares/auth");

router.get("/", commentController.getAllComments);
router.get("/:commentId", commentController.getSingleComment);
router.post("/", verifyAccessToken, commentController.createComment);
router.put("/:commentId", verifyAccessToken, commentController.updateComment);
router.delete("/:commentId", verifyAccessToken, commentController.deleteComment);

module.exports = router;
