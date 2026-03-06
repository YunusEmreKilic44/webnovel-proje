const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Giris gerekli.",
      });
    }

    const role = req.user.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Bu islem icin yetkiniz yok.",
      });
    }

    return next();
  };
};

module.exports = {
  authorizeRoles,
};
