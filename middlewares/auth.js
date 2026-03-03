const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token gerekli! Lütfen giriş yapınız!",
    });
  }

  try {
    const decoded = jwt.verify(token, accessToken.secret);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Geçersiz veya süresi dolmuş token",
    });
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const token = req.body.refreshToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token gerekli" });
  }

  try {
    // 1) Önce verify (format/expiry için)
    const decoded = jwt.verify(token, refreshToken.secret);

    // 2) DB'de var mı? (rotation/reuse kontrolü)
    const storedToken = await RefreshToken.findOne({
      token,
      userId: decoded.id, // RefreshToken şemanda userId varsa daha güvenli
    });

    if (!storedToken) {
      return res
        .status(401)
        .json({ success: false, message: "Geçersiz refresh token" });
    }

    req.user = decoded; // { id: ... }
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Geçersiz veya süresi dolmuş refresh token",
    });
  }
};

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
};
