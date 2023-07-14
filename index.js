console.log("arg2", process.argv[2]);
if (process.argv[2] === "production") {
  require("dotenv").config({
    path: __dirname + "/production.env",
  });
} else {
  require("dotenv").config();
}

//使用multer處理上傳檔案
// const multer = require("multer");
// const upload = multer({ dest: "tmp_uploads/" });

// 以下進階匯出方式上傳檔案
const upload = require(__dirname + "/modules/img-upload");

// 1.引入express
const express = require("express");

//將seesion存入mysql
const session = require("express-session");
const MysqlStore = require("express-mysql-session")(session);
//設定sql
const db = require(__dirname + "/modules/mysql2");
const sessionStore = new MysqlStore({}, db);

// 2.取用express
const app = express();

// 3.取用cors
const cors = require("cors");
const corsOption = {
  credentials: true,
  origin: (origin, cb) => {
    cb(null, true);
  },
};
app.use(cors(corsOption));

// 4.路由設定(按順序執行)
app.get("/", (req, res) => {
  res.send(`<h2>Hello</h2>
    <p>${process.env.DB_USER}</p>`);
  // res.render("home", { name: "yuuuu", db_user: process.env.DB_USER });
});

app.use("/products", require(__dirname + "/routes/products"));

//當js是array or obj會自動回傳json
app.get("/json", (req, res) => {
  res.json({
    name: "friend-trap",
    age: 5,
  });
});

//照片上傳（單張）
app.post("/try-upload", upload.single("avatar"), (req, res) => {
  console.log(req.file);
  res.json(req.file);
});
//照片上傳（多張）
app.post("/try-uploads", upload.array("photos", 10), (req, res) => {
  console.log(req.files);
  res.json(req.files.map((f) => f.filename)); //只要檔名,不是全部
});

//連線db
app.get("/try-db", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM `address_book` LIMIT 2");
  res.json(rows);
});

//設定靜態內容的資料夾(透過後端未經修改檔案都稱為靜態內容)
app.get("*", express.static("public"));
app.get("*", express.static("node_modules/bootstrap/dist"));

//自訂404頁面
app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("404-找不到網頁");
});

const port = process.env.PORT || 3000;
// 4.server 偵聽
app.listen(port, () => {
  console.log(`啟動~ port:${port}`);
});
