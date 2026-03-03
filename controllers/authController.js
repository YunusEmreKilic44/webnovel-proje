const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");

const generateTokens = (user) => {
  const userId = user._id ? user._id.toString() : user.id;
  const userRole = user.role || "user";
  const username = user.username;

  const accessTokenPayload = {
    id: userId,
    email: user.email,
    role: userRole,
    username,
  };
  const refreshTokenPayload = { id: userId };

  const newAccessToken = jwt.sign(accessTokenPayload, accessToken.secret, {
    expiresIn: accessToken.expiresIn,
  });

  const newRefreshToken = jwt.sign(refreshTokenPayload, refreshToken.secret, {
    expiresIn: refreshToken.expiresIn,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email ve password zorunludur",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();
    const rawPassword = String(password);

    if (rawPassword.length < 6 || rawPassword.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Parola 6 ile 20 karakter arasinda olmalidir",
      });
    }

    const existingUserEmail = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean();
    if (existingUserEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Bu email adresi zaten kayitli" });
    }

    const existingUserUsername = await User.findOne({
      username: normalizedUsername,
    })
      .select("_id")
      .lean();
    if (existingUserUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Bu username zaten kayitli" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(rawPassword, salt);

    const createdUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const userObj = createdUser.toObject();
    delete userObj.password;

    return res.status(201).json({ success: true, data: userObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email ve password zorunludur",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Gecersiz email veya sifre" });
    }

    const validPassword = await bcryptjs.compare(
      String(password),
      existingUser.password,
    );

    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Gecersiz email veya sifre" });
    }

    const userWithoutPassword = {
      id: existingUser._id.toString(),
      email: existingUser.email,
      username: existingUser.username,
      role: existingUser.role,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt,
    };

    const tokens = generateTokens(existingUser);

    await RefreshToken.deleteMany({ userId: existingUser._id });
    await RefreshToken.create({
      userId: existingUser._id,
      token: tokens.refreshToken,
    });

    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
      tokens,
      message: "Giris basarili!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const refreshTokens = async (req, res) => {
  try {
    const oldRefreshToken = req.body.refreshToken;

    if (!oldRefreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token degeri zorunludur!",
      });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(oldRefreshToken, refreshToken.secret);
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        message: "Refresh token gecersiz veya suresi dolmus.",
      });
    }

    const storedToken = await RefreshToken.findOne({
      token: oldRefreshToken,
      userId: decodedToken.id,
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token gecersiz veya kullanilmis.",
      });
    }

    const user = await User.findById(decodedToken.id).select(
      "email username role",
    );
    if (!user) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(404).json({
        success: false,
        message: "Kullanici bulunamadi. Lutfen tekrar giris yapin.",
      });
    }

    const tokens = generateTokens(user);

    await RefreshToken.deleteOne({ _id: storedToken._id });
    await RefreshToken.create({
      userId: user._id,
      token: tokens.refreshToken,
    });

    return res.status(200).json({
      success: true,
      tokens,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
};
