console.log("arg2", process.argv[2]);
if (process.argv[2] === "production") {
  require("dotenv").config({
    path: __dirname + "/production.env",
  });
} else {
  require("dotenv").config();
}

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
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 3.取用cors
const cors = require("cors");
const corsOption = {
  credentials: true,
  origin: (origin, cb) => {
    cb(null, true);
  },
};
app.use(cors(corsOption));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 4.路由設定(自行依序往下新增)
app.get("/", (req, res) => {
  res.send(`<h2>Hello</h2>
    <p>${process.env.DB_USER}</p>`);
});
app.use("/products", require(__dirname + "/routes/example")); //主程式掛API示範
app.use("/restaurant", require(__dirname + "/routes/restaurant"))
app.use("/restphoto", require(__dirname + "/routes/rest-photo"))

app.use("/forum", require(__dirname + "/routes/forum")); //留言板進入點
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
  const [rows] = await db.query("SELECT * FROM `address_book` LIMIT 1");
  res.json(rows);
});

// 自訂行程-建立行程表單
app.use("/custom-itinerary", require(__dirname + "/routes/itinerary-create-task"));

//自訂行程-上傳照片
// app.post("/try-previw",upload.single('img'),(req,res)=>{
//   console.log(req.file)
//   res.json(req.file)
// })




app.use("/login", require(__dirname + "/routes/auth"));
app.use("/register", require(__dirname + "/routes/register"));
// 登入
// 要使用此程式才能使用：app.use(express.urlencoded({ extended: false }));
// 可以抓到 JSON：app.use(express.json());
app.post("/login", async (req, res) => {
  const output = {
    success: false,
    code: 0,
    error: "",
  };
  if (!req.body.email || !req.body.password) {
    output.error = "欄位資料不足";
    return res.json(output);
  }
  const sql = "SELECT * FROM member WHERE email=?";
  const [rows] = await db.query(sql, [req.body.email]); // 查詢來的需求 (使用者輸入的) email，結果放入 [rows] 內
  if (!rows.length) {
    // 帳號是錯的
    output.code = 402;
    output.error = "找不到此帳號";
    return res.json(output);
  }
  // const verified = await bcrypt.compare(req.body.password, rows[0].password);
  const verified = true; // 測試用，不管前端輸入什麼密碼皆會通過
  if (!verified) {
    // 密碼是錯的
    output.code = 406;
    output.error = "密碼錯誤";
    return res.json(output);
  }
  output.success = true;

  // 包 jwt 傳給前端
  const token = jwt.sign(
    {
      member_id: rows[0].member_id,
      email: rows[0].email,
    },
    process.env.JWT_SECRET // 設在 .env 的自己亂取的 jwt 金鑰 (JWT_SECRET)
  );

  // 登入成功的話，目前的 output Object 為：
  // output = { success: true, code: 0, error: "", }
  // 把資料使用 JSON 回應給 user // 在 user 端 (login.html 會將此放入 localstorage)
  output.data = {
    member_id: rows[0].member_id,
    email: rows[0].email,
    member_name: rows[0].member_name,
    images: rows[0].member_id,
    member_birth: rows[0].member_birth,
    id_number: rows[0].id_number,
    gender: rows[0].gender,
    location: rows[0].location,
    height: rows[0].height,
    weight: rows[0].weight,
    zodiac: rows[0].zodiac,
    bloodtype: rows[0].bloodtype,
    smoke: rows[0].smoke,
    alchohol: rows[0].alchohol,
    education_level: rows[0].education_level,
    job: rows[0].job,
    profile: rows[0].profile,
    mobile: rows[0].mobile,
    create_at: rows[0].create_at,
    token,
  };
  // 加入 output.data 為：
  // output = { success: true, code: 0, error: "", data: {id:會員id, email:會員email, nickname:會員綽號, token:jwt.sign形成的驗證亂碼 } }
  // 把所有登入資料全部回應給發出 req 的檔案
  res.json(output);
});

//設定靜態內容的資料夾(透過後端未經修改檔案都稱為靜態內容)
app.get("*", express.static("public"));
app.use("/product", require(__dirname + "/routes/product"));

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
