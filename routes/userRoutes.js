const express = require("express");
const userController = require("../controllers/userController");
const { verifyAccessToken } = require("../middlewares/auth");

const router = express.Router();

router.get("/", verifyAccessToken, userController.getAllUsers);
router.get("/:userId", verifyAccessToken, userController.getSingleUser);
router.put("/:userId", verifyAccessToken, userController.updateUser);
router.delete("/:userId", verifyAccessToken, userController.deleteUser);

module.exports = router;
