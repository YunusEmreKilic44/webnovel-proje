const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "dd.MM.yyyy - HH.mm.ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }

    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem,
    );
  } catch (err) {
    console.log(err);
  }
};

// Request Loglama middleware
const logger = (req, res, next) => {
  const message = `${req.method}\t${req.url}\t${req.headers.origin}\n`;

  logEvents(message, "reqLog.log");
  next();
};

module.exports = { logEvents, logger };
