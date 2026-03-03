const express = require("express");

const router = express.Router();

const chapterController = require("../controllers/chapterController");
const { verifyAccessToken } = require("../middlewares/auth");

router.get("/", chapterController.getAllChapters);
router.get("/:chapterId", chapterController.getSingleChapter);
router.post("/", verifyAccessToken, chapterController.createChapter);
router.put("/:chapterId", verifyAccessToken, chapterController.updateChapter);
router.delete("/:chapterId", verifyAccessToken, chapterController.deleteChapter);

module.exports = router;
