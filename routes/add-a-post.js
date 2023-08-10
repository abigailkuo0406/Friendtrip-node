const express = require("express")

const db = require(__dirname + "/../modules/mysql2")
const router = express.Router()

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
  let page = req.query.page ? parseInt(req.query.page) : 1 //目前顯示的頁面

  let where = "WHERE 1"

  const t_sql = `SELECT COUNT(1) totalRows FROM posts ${where}`
  const [[{ totalRows }]] = await db.query(t_sql)
  let totalPages = 0
  let rows = []
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage)
    ;[rows] = await db.query(sql)
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows }
  return res.json(output)
})

// 👇此為老師指導，為了圖檔上傳
const fileUpload = require("express-fileupload") //
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

app.use("/public/forum_pics", express.static("public/forum_pics"))

// ☝️此為老師指導，為了圖檔上傳

router.post("/add-a-post", upload.single("avatar"), async (req, res) => {
  console.log(req.file)
  console.log(req.body)
  console.log(req.body.content)
  const img = "http://localhost:3002/forum_pics/" + req.file.originalname
  const sql = "INSERT INTO `posts`( `member_id`, `content`, `img`, `created_at`) VALUES (?,?,?,NOW())"
  const [rows] = await db.query(sql, [req.body.member_id, req.body.content, img])
  res.json(req.body)
})
module.exports = router
