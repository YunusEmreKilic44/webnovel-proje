const express = require("express");
const userController = require("../controllers/userController");
const { verifyAccessToken } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/roles");
const {
  validateObjectIdParam,
  validateUpdateUser,
} = require("../middlewares/validators");

const router = express.Router();

router.get("/", verifyAccessToken, authorizeRoles("admin"), userController.getAllUsers);
router.get(
  "/:userId",
  verifyAccessToken,
  validateObjectIdParam("userId"),
  userController.getSingleUser,
);
router.put(
  "/:userId",
  verifyAccessToken,
  validateUpdateUser,
  userController.updateUser,
);
router.delete(
  "/:userId",
  verifyAccessToken,
  validateObjectIdParam("userId"),
  userController.deleteUser,
);

module.exports = router;
