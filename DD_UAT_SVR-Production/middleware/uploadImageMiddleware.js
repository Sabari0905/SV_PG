const multer = require("multer");
const path = require("path");
const fs = require('fs');
const cors = require('cors');
const express = require('express')
const app = express();
// After app initialization
app.use(cors("*"));
// app.use(cors({
//   origin: 'http://localhost:3000', // Allow requests only from this origin
// }));

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadFolder = `./public/files`;
    fs.mkdir(uploadFolder, { recursive: true }, (err) => {
      err ?  cb(err, null) : cb(null, uploadFolder);
    });
  },
  filename: async function (req, file, cb) {
    cb(null, file.originalname)
  },
});

const uploadMiddleware = multer({ storage: storage });

module.exports = uploadMiddleware;
