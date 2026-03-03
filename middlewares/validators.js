const mongoose = require("mongoose");

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: errors[0],
    errors,
  });
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const validateObjectIdParam = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!isValidObjectId(value)) {
    return sendValidationError(res, [`Gecersiz ${paramName}`]);
  }
  return next();
};

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!isNonEmptyString(username)) {
    errors.push("username zorunludur");
  } else if (username.trim().length < 3 || username.trim().length > 30) {
    errors.push("username 3 ile 30 karakter arasinda olmalidir");
  }

  if (!isNonEmptyString(email)) {
    errors.push("email zorunludur");
  } else {
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      errors.push("email formati gecersiz");
    }
  }

  if (!isNonEmptyString(password)) {
    errors.push("password zorunludur");
  } else if (password.length < 6 || password.length > 20) {
    errors.push("password 6 ile 20 karakter arasinda olmalidir");
  }

  if (errors.length) return sendValidationError(res, errors);
  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!isNonEmptyString(email)) errors.push("email zorunludur");
  if (!isNonEmptyString(password)) errors.push("password zorunludur");

  if (errors.length) return sendValidationError(res, errors);
  return next();
};

const validateRefreshTokenRequest = (req, res, next) => {
  const { refreshToken } = req.body;
  if (!isNonEmptyString(refreshToken)) {
    return sendValidationError(res, ["refreshToken zorunludur"]);
  }
  return next();
};

const validateCreateBook = (req, res, next) => {
  const { title, description, coverImage } = req.body;
  const errors = [];

  if (!isNonEmptyString(title)) {
    errors.push("title zorunludur");
  } else if (title.trim().length < 2 || title.trim().length > 80) {
    errors.push("title 2 ile 80 karakter arasinda olmalidir");
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      errors.push("description string olmalidir");
    } else if (description.length > 2000) {
      errors.push("description en fazla 2000 karakter olabilir");
    }
  }

  if (coverImage !== undefined && typeof coverImage !== "string") {
    errors.push("coverImage string olmalidir");
  }

  if (errors.length) return sendValidationError(res, errors);
  return next();
};

const validateUpdateBook = (req, res, next) => {
  const { title, description, coverImage } = req.body;
  const errors = [];

  if (
    (title === undefined || title === "") &&
    (description === undefined || description === "") &&
    (coverImage === undefined || coverImage === "")
  ) {
    errors.push("Guncellenecek en az bir alan gondermelisiniz");
  }

  if (title !== undefined) {
    if (!isNonEmptyString(title)) {
      errors.push("title bos olamaz");
    } else if (title.trim().length < 2 || title.trim().length > 80) {
      errors.push("title 2 ile 80 karakter arasinda olmalidir");
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      errors.push("description string olmalidir");
    } else if (description.length > 2000) {
      errors.push("description en fazla 2000 karakter olabilir");
    }
  }

  if (coverImage !== undefined && typeof coverImage !== "string") {
    errors.push("coverImage string olmalidir");
  }

  if (errors.length) return sendValidationError(res, errors);
  return next();
};

const validateCreateChapter = (req, res, next) => {
  const { title, content, number } = req.body;
  const errors = [];

  if (!isNonEmptyString(title)) {
    errors.push("title zorunludur");
  } else if (title.trim().length < 1 || title.trim().length > 120) {
    errors.push("title 1 ile 120 karakter arasinda olmalidir");
  }

  if (!isNonEmptyString(content)) {
    errors.push("content zorunludur");
  } else if (content.length < 20 || content.length > 3000) {
    errors.push("content 20 ile 3000 karakter arasinda olmalidir");
  }

  if (number === undefined || number === null || number === "") {
    errors.push("number zorunludur");
  } else if (!Number.isInteger(Number(number)) || Number(number) < 0) {
    errors.push("number 0 veya daha buyuk tam sayi olmalidir");
  }

  if (errors.length) return sendValidationError(res, errors);
  return next();
};

const validateUpdateChapter = (req, res, next) => {
  const { title, content, number } = req.body;
  const errors = [];

  if (title === undefined && content === undefined && number === undefined) {
    errors.push("Guncellenecek en az bir alan gondermelisiniz");
  }

  if (title !== undefined) {
    if (!isNonEmptyString(title)) {
      errors.push("title bos olamaz");
    } else if (title.trim().length < 1 || title.trim().length > 120) {
      errors.push("title 1 ile 120 karakter arasinda olmalidir");
    }
  }

  if (content !== undefined) {
    if (!isNonEmptyString(content)) {
      errors.push("content bos olamaz");
    } else if (content.length < 20 || content.length > 3000) {
      errors.push("content 20 ile 3000 karakter arasinda olmalidir");
    }
  }

  if (number !== undefined) {
    if (!Number.isInteger(Number(number)) || Number(number) < 0) {
      errors.push("number 0 veya daha buyuk tam sayi olmalidir");
    }
  }

  if (errors.length) return sendValidationError(res, errors);
  return next();
};

const validateCreateComment = (req, res, next) => {
  const { content } = req.body;
  if (!isNonEmptyString(content)) {
    return sendValidationError(res, ["content zorunludur"]);
  }

  if (content.trim().length > 2000) {
    return sendValidationError(res, ["content en fazla 2000 karakter olabilir"]);
  }

  return next();
};

const validateUpdateComment = (req, res, next) => {
  const { content } = req.body;

  if (content === undefined) {
    return sendValidationError(res, ["content guncellemesi zorunludur"]);
  }

  if (!isNonEmptyString(content)) {
    return sendValidationError(res, ["content bos olamaz"]);
  }

  if (content.trim().length > 2000) {
    return sendValidationError(res, ["content en fazla 2000 karakter olabilir"]);
  }

  return next();
};

const validateUpdateUser = (req, res, next) => {
  const { username, email, password, avatar } = req.body;
  const errors = [];

  if (
    username === undefined &&
    email === undefined &&
    password === undefined &&
    avatar === undefined
  ) {
    errors.push("Guncellenecek en az bir alan gondermelisiniz");
  }

  if (username !== undefined) {
    if (!isNonEmptyString(username)) {
      errors.push("username bos olamaz");
    } else if (username.trim().length < 3 || username.trim().length > 30) {
      errors.push("username 3 ile 30 karakter arasinda olmalidir");
    }
  }

  if (email !== undefined) {
    if (!isNonEmptyString(email)) {
      errors.push("email bos olamaz");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim().toLowerCase())) {
        errors.push("email formati gecersiz");
      }
    }
  }

  if (password !== undefined) {
    if (!isNonEmptyString(password)) {
      errors.push("password bos olamaz");
    } else if (password.length < 6 || password.length > 20) {
      errors.push("password 6 ile 20 karakter arasinda olmalidir");
    }
  }

  if (avatar !== undefined && typeof avatar !== "string") {
    errors.push("avatar string olmalidir");
  }

  if (errors.length) return sendValidationError(res, errors);
  return next();
};

module.exports = {
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
