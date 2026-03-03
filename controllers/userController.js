const User = require("../models/User");
const bcryptjs = require("bcryptjs");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanici bulunamadi!" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Guncelleme icin userId zorunludur" });
    }

    const { username, email, password, avatar } = req.body;
    const updatePayload = {};

    if (email && email.trim()) updatePayload.email = email.trim();
    if (username && username.trim()) updatePayload.username = username.trim();
    if (password && String(password).trim()) {
      const rawPassword = String(password);
      if (rawPassword.length < 6 || rawPassword.length > 20) {
        return res.status(400).json({
          success: false,
          message: "Parola 6 ile 20 karakter arasinda olmalidir",
        });
      }

      const salt = await bcryptjs.genSalt(10);
      updatePayload.password = await bcryptjs.hash(rawPassword, salt);
    }
    if (avatar && avatar.trim()) updatePayload.avatar = avatar.trim();

    if (!Object.keys(updatePayload).length) {
      return res.status(400).json({
        success: false,
        message: "Guncellenecek en az 1 alan gondermelisiniz.",
      });
    }

    if (updatePayload.email) {
      const existingUser = await User.findOne({ email: updatePayload.email })
        .select("_id")
        .lean();

      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: "Bu email adresi zaten kullanimda",
        });
      }
    }

    const updateUser = await User.findByIdAndUpdate(userId, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updateUser) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanici bulunamadi!" });
    }
    return res.status(200).json({ success: true, data: updateUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Giris gerekli." });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    const isAdmin = req.user.role === "admin";
    const isSelf = currentUserId === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "Bu islemi yapmak icin yetkiniz yok!",
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanici bulunamadi." });
    }

    return res.status(200).json({ success: true, message: "Kullanici silindi" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
