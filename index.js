const fs = require("fs");
console.log("arg2", process.argv[2]);
if (process.argv[2] === "production") {
  require("dotenv").config({
    path: __dirname + "/production.env"
  })
} else {
  require("dotenv").config()
}

// 以下進階匯出方式上傳檔案
const upload = require(__dirname + "/modules/img-upload");
const previewForumPic = require(__dirname + "/modules/forum-img-preview");

// 建立自訂行程照片上傳到指定資料夾
const previewInitImg = require(__dirname + "/modules/itinerary-img-preview");

// 1.引入express
const express = require("express")

//將seesion存入mysql
const session = require("express-session")
const MysqlStore = require("express-mysql-session")(session)
//設定sql
const db = require(__dirname + "/modules/mysql2")
const sessionStore = new MysqlStore({}, db)

// 2.取用express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3.取用cors
const cors = require("cors")
const corsOption = {
  credentials: true,
  origin: (origin, cb) => {
    cb(null, true)
  }
}
app.use(cors(corsOption))
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

app.use((req, res, next) => {
  // res.locals.nickname = '小新';
  // res.locals.title = '小新的網站';

  const auth = req.get("Authorization")
  if (auth && auth.indexOf("Bearer ") === 0) {
    const token = auth.slice(7)
    let jwtData = null
    try {
      jwtData = jwt.verify(token, process.env.JWT_SECRET)

      // 測試的情況, 預設是登入

      // jwtData = {
      //   id: 12,
      //   email: 'test@test.com'
      // }
    } catch (ex) {}
    if (jwtData) {
      res.locals.jwtData = jwtData // 標記有沒有使用 token
    }
  }

  next()
})

app.use((req, res, next) => {
  // res.locals.nickname = '小新';
  // res.locals.title = '小新的網站';

  const auth = req.get("Authorization");
  if (auth && auth.indexOf("Bearer ") === 0) {
    const token = auth.slice(7);
    let jwtData = null;
    try {
      jwtData = jwt.verify(token, process.env.JWT_SECRET);

      // 測試的情況, 預設是登入

      // jwtData = {
      //   id: 12,
      //   email: 'test@test.com'
      // }
    } catch (ex) { }
    if (jwtData) {
      res.locals.jwtData = jwtData; // 標記有沒有使用 token
    }
  }

  next();
  
});

app.use((req, res, next) => {
  // res.locals.nickname = '小新';
  // res.locals.title = '小新的網站';

  const auth = req.get("Authorization");
  if (auth && auth.indexOf("Bearer ") === 0) {
    const token = auth.slice(7);
    let jwtData = null;
    try {
      jwtData = jwt.verify(token, process.env.JWT_SECRET);

      // 測試的情況, 預設是登入

      // jwtData = {
      //   id: 12,
      //   email: 'test@test.com'
      // }
    } catch (ex) { }
    if (jwtData) {
      res.locals.jwtData = jwtData; // 標記有沒有使用 token
    }
  }

  next();

});

// 4.路由設定(自行依序往下新增)
app.get("/", (req, res) => {
  res.send(`<h2>Hello</h2>
    <p>${process.env.DB_USER}</p>`)
})
app.use("/twoBooks", require(__dirname + "/routes/example")) //主程式掛API示範
app.use("/restaurant", require(__dirname + "/routes/restaurant"))
app.use("/restphoto", require(__dirname + "/routes/rest-photo"))
app.use("/area", require(__dirname + "/routes/area"))
app.use("/restmeal", require(__dirname + "/routes/rest-meal"))
app.use("/friends", require(__dirname + "/routes/friends"))
app.use("/reserve", require(__dirname + "/routes/reserve"))
app.use("/reserveinvites", require(__dirname + "/routes/reserve-invites"))
app.use("/comment", require(__dirname + "/routes/rest-comment"))

app.use("/restaurant", require(__dirname + "/routes/restaurant"));
app.use("/restphoto", require(__dirname + "/routes/rest-photo"));
app.use("/area", require(__dirname + "/routes/area"));
app.use("/restmeal", require(__dirname + "/routes/rest-meal"));
app.use("/friends", require(__dirname + "/routes/friends"));
app.use("/reserve", require(__dirname + "/routes/reserve"));
app.use("/reserveinvites", require(__dirname + "/routes/reserve-invites"));

app.use("/product", require(__dirname + "/routes/product"));
app.use("/checkout", require(__dirname + "/routes/checkout"));
app.use("/order", require(__dirname + "/routes/order"));
app.use("/collection", require(__dirname + "/routes/collection"));
app.use("/show-forum-posts", require(__dirname + "/routes/forum-posts")); //留言板進入點
app.use("/leftMsg", require(__dirname + "/routes/forum-posts"));

app.use("/add-a-new-post", require(__dirname + "/routes/add-a-post"));


app.use("/custom-itinerary",require(__dirname + "/routes/itinerary-create-task"));// 自訂行程-建立行程表單
app.use("/public-itinerary",require(__dirname + "/routes/public-itinerary"));
// 公開行程


app.use("/add-a-new-post", require(__dirname + "/routes/add-a-post"))
//照片上傳（單張）
app.use("/show-forum-posts", require(__dirname + "/routes/forum-posts")) //留言板進入點
app.use("/show-my-posts", require(__dirname + "/routes/my-posts")) //留言板進入點
app.use("/delete-a-post-of-mine", require(__dirname + "/routes/delete-a-post"))
// 👇 將 comments 寫入資料庫
app.use("/add-a-new-comment", require(__dirname + "/routes/addNewComment"))
// ☝️ 將 comments 寫入資料庫
app.post("/preview", upload.single("preview"), (req, res) => {
  console.log(req.file)
  res.json(req.file)
})
//照片上傳（多張）
app.post("/try-uploads", upload.array("photos", 10), (req, res) => {
  console.log(req.files)
  res.json(req.files.map(f => f.filename)) //只要檔名,不是全部
})

//連線db
app.get("/try-db", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM `address_book` LIMIT 1")
  res.json(rows)
})

// 自訂行程-建立行程表單
app.use("/custom-itinerary", require(__dirname + "/routes/itinerary-create-task"))

//自訂行程-上傳照片(建立表單)
app.post("/try-preview", previewInitImg.single("coverPhoto"), (req, res) => {
  console.log(req.file)
  res.json(req.file)
})

const request = require("request")
const path = require("path")

app.post("/upload-viewPhoto", (req, res) => {
  const output = {
    success: false,
    code: 0,
    error: ""
  }
  const photoName = req.body.photoName + ".jpg"
  const imageUrl = req.body.photoUrl

  const downloadDir = path.join(__dirname, "/public/img/view-img")
  // 確保 download 資料夾存在，如果不存在就創建它
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir)
  }
  // 從 URL 下載圖片並保存到 download 資料夾中

  const fileName = path.basename(photoName) // 從 URL 中取得檔案名稱
  const filePath = path.join(downloadDir, fileName) // 拼接儲存的完整路徑
  if (!fs.existsSync(filePath)) {
    // 使用 request 套件進行下載
    request(imageUrl)
      .on("error", err => {
        console.error("下載圖片時發生錯誤：", err)
        output.code = 333
        output.error = "下載圖片時發生錯誤："
        return res.json(output)
      })
      .pipe(fs.createWriteStream(filePath))
      .on("close", () => {
        console.log(fileName, "圖片下載完成！")
        output.success = true
        return res.json(output)
      })
  } else {
    console.log(fileName, "圖片已存在，不需下載！")
    output.success = true
    return res.json(output)
  }
})

//自訂行程-儲存景點行程
app.use("/save-view", require(__dirname + "/routes/save-view-task"))
app.use("/login", require(__dirname + "/routes/auth"))
app.use("/register", require(__dirname + "/routes/register"))
// app.use("/edit", require(__dirname + "/routes/edit"));
app.use("/catchMember", require(__dirname + "/routes/catchMember"))

//自訂行程-安排行程讀取最新行程名稱
app.get("/try-name", async (req, res) => {
  const [rows] = await db.query(`SELECT name,itin_member_id FROM itinerary WHERE itin_member_id=2 ORDER BY create_at DESC `, [req.member_id])
  res.json(rows)
})
//自訂行程-取得該會員最新行程編號
app.get("/get-itin_id", async (req, res) => {
  const itin_member = req.query.itin_member
  console.log("itin_member=>", itin_member)

  const [result] = await db.query(`SELECT itin_id,name FROM itinerary WHERE itin_member_id=? ORDER BY create_at DESC limit 1 `, [itin_member])
  console.log("result intin_id=>", result)
  res.json(result)
})

// 登入
// 要使用此程式才能使用：app.use(express.urlencoded({ extended: false }));
// 可以抓到 JSON：app.use(express.json());
app.post("/login", async (req, res) => {
  const output = {
    success: false,
    code: 0,
    error: ""
  }
  if (!req.body.email || !req.body.password) {
    output.error = "欄位資料不足"
    return res.json(output)
  }
  const sql = "SELECT * FROM member WHERE email=?"
  const [rows] = await db.query(sql, [req.body.email]) // 查詢來的需求 (使用者輸入的) email，結果放入 [rows] 內
  if (!rows.length) {
    // 帳號是錯的
    output.code = 402
    output.error = "找不到此帳號"
    return res.json(output)
  }
  // const verified = await bcrypt.compare(req.body.password, rows[0].password);
  const verified = true // 測試用，不管前端輸入什麼密碼皆會通過
  if (!verified) {
    // 密碼是錯的
    output.code = 406
    output.error = "密碼錯誤"
    return res.json(output)
  }
  output.success = true

  // 包 jwt 傳給前端
  const token = jwt.sign(
    {
      member_id: rows[0].member_id,
      email: rows[0].email
    },
    process.env.JWT_SECRET // 設在 .env 的自己亂取的 jwt 金鑰 (JWT_SECRET)
  )

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
    token
  }
  // 加入 output.data 為：
  // output = { success: true, code: 0, error: "", data: {id:會員id, email:會員email, nickname:會員綽號, token:jwt.sign形成的驗證亂碼 } }
  // 把所有登入資料全部回應給發出 req 的檔案
  res.json(output);
});

//設定靜態內容的資料夾(透過後端未經修改檔案都稱為靜態內容)
app.get("*", express.static("public"))

//自訂404頁面
app.use((req, res) => {
  res.type("text/plain")
  res.status(404)
  res.send("404-找不到網頁")
})

const port = process.env.PORT || 3000
// 4.server 偵聽
app.listen(port, () => {
  console.log(`啟動~ port:${port}`)
})
