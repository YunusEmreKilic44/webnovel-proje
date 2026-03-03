require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/dbConfig");
const { logger } = require("./middlewares/logEvent");
const chapterRoutes = require("./routes/chapterRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require("./routes/authRoutes.js");

connectDB();

app.use(logger);

// Middleware to parse json body
app.use(express.json());

// Content-Type application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/books/:bookId/chapters", chapterRoutes);
app.use("/api/books/:bookId/comments", commentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Sunucu: ${process.env.PORT} portunda çalışıyor!`);
});
