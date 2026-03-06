const mongoose = require("mongoose");
const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((error) => error.msg);
  return res.status(400).json({
    success: false,
    message: errors[0],
    errors,
  });
};

const objectIdParamRule = (paramName) =>
  param(paramName)
    .custom((value) => mongoose.isValidObjectId(value))
    .withMessage(`Gecersiz ${paramName}`);

const validateObjectIdParam = (paramName) => [
  objectIdParamRule(paramName),
  handleValidationErrors,
];

const validateRegister = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username zorunludur")
    .isLength({ min: 3, max: 30 })
    .withMessage("username 3 ile 30 karakter arasinda olmalidir"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email zorunludur")
    .isEmail()
    .withMessage("email formati gecersiz"),
  body("password")
    .notEmpty()
    .withMessage("password zorunludur")
    .isLength({ min: 6, max: 20 })
    .withMessage("password 6 ile 20 karakter arasinda olmalidir"),
  handleValidationErrors,
];

const validateLogin = [
  body("email").trim().notEmpty().withMessage("email zorunludur"),
  body("password").notEmpty().withMessage("password zorunludur"),
  handleValidationErrors,
];

const validateRefreshTokenRequest = [
  body("refreshToken").trim().notEmpty().withMessage("refreshToken zorunludur"),
  handleValidationErrors,
];

const validateCreateBook = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title zorunludur")
    .isLength({ min: 2, max: 80 })
    .withMessage("title 2 ile 80 karakter arasinda olmalidir"),
  body("description")
    .optional()
    .isString()
    .withMessage("description string olmalidir")
    .isLength({ max: 2000 })
    .withMessage("description en fazla 2000 karakter olabilir"),
  body("coverImage")
    .optional()
    .isString()
    .withMessage("coverImage string olmalidir"),
  handleValidationErrors,
];

const validateUpdateBook = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("title bos olamaz")
    .isLength({ min: 2, max: 80 })
    .withMessage("title 2 ile 80 karakter arasinda olmalidir"),
  body("description")
    .optional()
    .isString()
    .withMessage("description string olmalidir")
    .isLength({ max: 2000 })
    .withMessage("description en fazla 2000 karakter olabilir"),
  body("coverImage")
    .optional()
    .isString()
    .withMessage("coverImage string olmalidir"),
  body().custom((payload, { req }) => {
    const hasAnyField =
      payload &&
      (payload.title !== undefined ||
        payload.description !== undefined ||
        payload.coverImage !== undefined);

    if (!hasAnyField && !req.file) {
      throw new Error("Guncellenecek en az bir alan gondermelisiniz");
    }
    return true;
  }),
  handleValidationErrors,
];

const validateCreateChapter = [
  objectIdParamRule("bookId"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title zorunludur")
    .isLength({ min: 1, max: 120 })
    .withMessage("title 1 ile 120 karakter arasinda olmalidir"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("content zorunludur")
    .isLength({ min: 20, max: 3000 })
    .withMessage("content 20 ile 3000 karakter arasinda olmalidir"),
  body("number")
    .notEmpty()
    .withMessage("number zorunludur")
    .isInt({ min: 0 })
    .withMessage("number 0 veya daha buyuk tam sayi olmalidir")
    .toInt(),
  handleValidationErrors,
];

const validateUpdateChapter = [
  objectIdParamRule("bookId"),
  objectIdParamRule("chapterId"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("title bos olamaz")
    .isLength({ min: 1, max: 120 })
    .withMessage("title 1 ile 120 karakter arasinda olmalidir"),
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("content bos olamaz")
    .isLength({ min: 20, max: 3000 })
    .withMessage("content 20 ile 3000 karakter arasinda olmalidir"),
  body("number")
    .optional()
    .isInt({ min: 0 })
    .withMessage("number 0 veya daha buyuk tam sayi olmalidir")
    .toInt(),
  body().custom((payload) => {
    const hasAnyField =
      payload &&
      (payload.title !== undefined ||
        payload.content !== undefined ||
        payload.number !== undefined);

    if (!hasAnyField) {
      throw new Error("Guncellenecek en az bir alan gondermelisiniz");
    }
    return true;
  }),
  handleValidationErrors,
];

const validateCreateComment = [
  objectIdParamRule("bookId"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("content zorunludur")
    .isLength({ max: 2000 })
    .withMessage("content en fazla 2000 karakter olabilir"),
  handleValidationErrors,
];

const validateUpdateComment = [
  objectIdParamRule("bookId"),
  objectIdParamRule("commentId"),
  body("content")
    .notEmpty()
    .withMessage("content guncellemesi zorunludur")
    .trim()
    .notEmpty()
    .withMessage("content bos olamaz")
    .isLength({ max: 2000 })
    .withMessage("content en fazla 2000 karakter olabilir"),
  handleValidationErrors,
];

const validateUpdateUser = [
  objectIdParamRule("userId"),
  body("username")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("username bos olamaz")
    .isLength({ min: 3, max: 30 })
    .withMessage("username 3 ile 30 karakter arasinda olmalidir"),
  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("email bos olamaz")
    .isEmail()
    .withMessage("email formati gecersiz"),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("password bos olamaz")
    .isLength({ min: 6, max: 20 })
    .withMessage("password 6 ile 20 karakter arasinda olmalidir"),
  body("avatar").optional().isString().withMessage("avatar string olmalidir"),
  body().custom((payload, { req }) => {
    const hasAnyField =
      payload &&
      (payload.username !== undefined ||
        payload.email !== undefined ||
        payload.password !== undefined ||
        payload.avatar !== undefined);

    if (!hasAnyField && !req.file) {
      throw new Error("Guncellenecek en az bir alan gondermelisiniz");
    }
    return true;
  }),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateObjectIdParam,
  validateRegister,
  validateLogin,
  validateRefreshTokenRequest,
  validateCreateBook,
  validateUpdateBook,
  validateCreateChapter,
  validateUpdateChapter,
  validateCreateComment,
  validateUpdateComment,
  validateUpdateUser,
};
