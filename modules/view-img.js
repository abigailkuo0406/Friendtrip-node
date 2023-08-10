const multer = require("multer");
const fs = require('fs');
const path = require('path');

const path = require('path');

//判斷存入照片的副檔名
const extMap = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

//定義存放在哪裡及檔名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/../public/img/view-img");
  },
  filename: (req, file, cb) => {
    const ext = extMap[file.mimetype];
    cb(null, file.originalname);
  },
});

//利用mimetype決定副檔名
const fileFilter = (req, file, cb) => {
  cb(null, !!extMap[file.mimetype]);
};

module.exports = multer({ fileFilter, storage });
