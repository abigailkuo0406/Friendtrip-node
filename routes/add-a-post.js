const express = require("express")

const db = require(__dirname + "/../modules/mysql2")
// const dayjs = require("dayjs");
const router = express.Router()
// const upload = require(__dirname + "/../modules/img-upload");
// const multipartParser = upload.none();

router.get("/", async (req, res) => {
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 25,
    totalPages: 0,
    page: 1,
    rows: []
  }
  const perPage = 2 //一頁幾筆資料
  // let keyword = req.query.keyword || "";
  let page = req.query.page ? parseInt(req.query.page) : 1 //目前顯示的頁面
  // if (!page || page < 1) {
  //   output.redirect = req.baseUrl;
  //   return res.json(output);
  // }

  let where = "WHERE 1"
  // if (keyword) {
  //   const kw_escaped = db.escape("%" + keyword + "%");
  //   where += ` AND (
  //         \`bookname\` LIKE ${kw_escaped}
  //         OR
  //         \`author\` LIKE ${kw_escaped}
  //         )
  //       `;
  // }

  const t_sql = `SELECT COUNT(1) totalRows FROM posts ${where}`
  const [[{ totalRows }]] = await db.query(t_sql)
  let totalPages = 0
  let rows = []
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage)
    // if (page > totalPages) {
    //   output.redirect = req.baseUrl + "?page=" + totalPages;
    //   return res.json(output);
    // }
    // ${where} LIMIT ${perPage * (page - 1)}, ${perPage}
    ;[rows] = await db.query(sql)
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows }
  return res.json(output)
})

// 👇此為老師指導，為了圖檔上傳
const fileUpload = require("express-fileupload") //
// const bodyParser = require("body-parser")
// const cors = require("cors")
// const morgan = require("morgan")
const _ = require("lodash")
const app = express()

const multer = require("multer")
//判斷存入照片的副檔名
const extMap = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": "webp"
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/forum_pics")
  },
  filename: (req, file, cb) => {
    const ext = extMap[file.mimetype]
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })
// enable files upload
app.use(
  fileUpload({
    createParentPath: true
  })
)

// 加入其它的 middleware
// app.use(cors)
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(morgan("dev"))

// 讓 uploads 目錄公開
// https://expressjs.com/zh-tw/starter/static-files.html
// app.use(express.static('uploads))
// 如果想要改網址路徑用下面的
// 可以透過 /static 路徑字首，來載入 uploads 目錄中的檔案
app.use("/public/forum_pics", express.static("public/forum_pics"))

// 單檔上傳測試
// --------------------------------------
// app.post("/upload-avatar", async (req, res) => {
//   console.log(req.files)
//   try {
//     if (!req.files) {
//       res.send({
//         status: false,
//         message: "No file uploaded"
//       })
//     } else {
//       // 使用輸入框的名稱來獲取上傳檔案 （例如 'avatar'）
//       let avatar = req.files.avatar

//       // 使用 mv() 方法來移動上傳檔案到要放置的目錄裡（例如 'uploads'）
//       avatar.mv("./public/forum_pics/" + avatar.name)

// 送出回應
//     res.json({
//       status: true,
//       message: "File is uploaded",
//       data: {
//         name: avatar.name,
//         mimetype: avatar.mimetype,
//         size: avatar.size
//       }
//     })
//   }
// } catch (err) {
//   res.status(500).json(err)
// }
// })

// ☝️此為老師指導，為了圖檔上傳

router.post("/add-a-post", upload.single("avatar"), async (req, res) => {
  // 以下程式將前端獲得的圖檔上傳到 node server （記得改對應的名字）
  console.log(req.file)
  console.log(req.body)
  console.log(req.body.content) //ftfyjjyfyk
  const img = "http://localhost:3002/forum_pics/" + req.file.originalname
  const sql = "INSERT INTO `posts`( `member_id`, `content`, `img`, `created_at`) VALUES (?,?,?,NOW())"
  const [rows] = await db.query(sql, [1, req.body.content, img])
  res.json(req.body)
  // const { content } = req.body
  // const query = "INSERT INTO posts (content) VALUES (?, ?)"
})
// router.get("/:book_sid", async (req, res) => {
//   const output = {
//     success: false,
//     error: "",
//     row: null,
//   };

//   const book_sid = parseInt(req.params.book_sid) || 0;
//   if (!book_sid) {
//     // 沒有 sid
//     output.error = "沒有 sid !";
//   } else {
//     const sql = `SELECT * FROM posts WHERE sid=${book_sid}`;
//     const [rows] = await db.query(sql);

//     if (rows.length) {
//       output.success = true;
//       output.row = rows[0];
//     } else {
//       // 沒有資料
//       output.error = "沒有資料 !";
//     }
//   }
//   res.json(output);
// });
module.exports = router
