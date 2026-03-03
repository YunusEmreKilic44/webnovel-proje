const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateRefreshTokenRequest,
} = require("../middlewares/validators");

router.post("/register", validateRegister, authController.registerUser);
router.post("/login", validateLogin, authController.loginUser);
router.post(
  "/refresh-token",
  validateRefreshTokenRequest,
  authController.refreshTokens,
);

module.exports = router;
