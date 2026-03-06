const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const createStorage = (folderName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "..", "uploads", folderName);
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${Date.now()}-${uuidv4()}${extension}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    return cb(new Error("Sadece JPEG, PNG veya WEBP gorsel yukleyebilirsiniz"));
  }
  return cb(null, true);
};

const createUploader = (folderName, fieldName) =>
  multer({
    storage: createStorage(folderName),
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter,
  }).single(fieldName);

const withUploadErrorHandling = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Dosya boyutu en fazla 5MB olabilir",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Dosya yukleme hatasi",
    });
  });
};

const uploadBookCover = withUploadErrorHandling(
  createUploader("books", "coverImage"),
);
const uploadAvatar = withUploadErrorHandling(createUploader("avatars", "avatar"));

module.exports = {
  uploadBookCover,
  uploadAvatar,
};
