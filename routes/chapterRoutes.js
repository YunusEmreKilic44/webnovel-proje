const express = require("express");

const router = express.Router({ mergeParams: true });

const chapterController = require("../controllers/chapterController");
const { verifyAccessToken } = require("../middlewares/auth");
const {
  validateObjectIdParam,
  validateCreateChapter,
  validateUpdateChapter,
} = require("../middlewares/validators");

router.get(
  "/",
  validateObjectIdParam("bookId"),
  chapterController.getAllChapters,
);
router.get(
  "/:chapterId",
  validateObjectIdParam("bookId"),
  validateObjectIdParam("chapterId"),
  chapterController.getSingleChapter,
);
router.post(
  "/",
  verifyAccessToken,
  validateCreateChapter,
  chapterController.createChapter,
);
router.put(
  "/:chapterId",
  verifyAccessToken,
  validateUpdateChapter,
  chapterController.updateChapter,
);
router.delete(
  "/:chapterId",
  verifyAccessToken,
  validateObjectIdParam("bookId"),
  validateObjectIdParam("chapterId"),
  chapterController.deleteChapter,
);

module.exports = router;
