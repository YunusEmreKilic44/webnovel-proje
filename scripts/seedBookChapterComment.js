require("dotenv").config();
const mongoose = require("mongoose");

const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const Comment = require("../models/Comment");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/webnovel";

function buildChapterContent(bookIndex, chapterNumber) {
  return [
    `Book ${bookIndex + 1} chapter ${chapterNumber} starts with a quiet scene in the old district.`,
    "The main character follows a clue and meets someone unexpected in the market.",
    "A short conflict raises the stakes and reveals a hidden motive.",
    "The chapter closes with a small twist that leads into the next part.",
  ].join(" ");
}

async function ensureSeedUsers(minCount = 10) {
  const existingUsers = await User.find({}, "_id").lean();
  if (existingUsers.length >= minCount) {
    return existingUsers.map((u) => u._id);
  }

  const usersToCreate = [];
  const need = minCount - existingUsers.length;
  const stamp = Date.now();

  for (let i = 0; i < need; i += 1) {
    usersToCreate.push({
      username: `seed_user_${stamp}_${i + 1}`,
      email: `seed_user_${stamp}_${i + 1}@example.com`,
      password: "seed-password-123",
      role: "user",
    });
  }

  const createdUsers = await User.insertMany(usersToCreate);
  return [...existingUsers.map((u) => u._id), ...createdUsers.map((u) => u._id)];
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected.");

  const userIds = await ensureSeedUsers(10);
  if (!userIds.length) {
    throw new Error("No users found or created for author/comment relations.");
  }

  await Comment.deleteMany({});
  await Chapter.deleteMany({});
  await Book.deleteMany({});

  const books = Array.from({ length: 20 }, (_, i) => ({
    title: `Seed Book ${i + 1}`,
    description: `This is sample description for seed book ${i + 1}.`,
    coverImage: `https://picsum.photos/seed/book-${i + 1}/400/600`,
    author: userIds[i % userIds.length],
  }));

  const createdBooks = await Book.insertMany(books);

  const chapters = [];
  const comments = [];

  createdBooks.forEach((book, bookIndex) => {
    for (let chapterNumber = 1; chapterNumber <= 20; chapterNumber += 1) {
      chapters.push({
        title: `Chapter ${chapterNumber}`,
        content: buildChapterContent(bookIndex, chapterNumber),
        number: chapterNumber,
        book: book._id,
      });
    }

    for (let commentNumber = 1; commentNumber <= 20; commentNumber += 1) {
      comments.push({
        book: book._id,
        user: userIds[(bookIndex + commentNumber) % userIds.length],
        content: `Sample comment ${commentNumber} for book ${bookIndex + 1}: the pacing and character moments are engaging.`,
      });
    }
  });

  await Chapter.insertMany(chapters);

  await Comment.insertMany(comments);

  console.log("Seeding completed: 20 books, 400 chapters, 400 comments.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
