const multer = require("multer");
const { v4 } = require("uuid");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    const newFilename = v4() + "." + file.mimetype.split("/")[1];
    cb(null, newFilename);
  },
});

const upload = multer({ storage });

module.exports = { storage, upload };
