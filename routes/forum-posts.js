const express = require("express")
const db = require(__dirname + "/../modules/mysql2")
const router = express.Router()
// const dayjs = require("dayjs")
// const upload = require(__dirname + "/../modules/img-upload");
// const multipartParser = upload.none();

router.get("/", async (req, res) => {
  const { member_id } = req.query
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
  let comments = []
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage)
    // =======================================================
    const sql = `SELECT
    posts.*,
    member.images,
    member.member_name
FROM
    posts
LEFT JOIN member ON posts.member_id = member.member_id
ORDER BY
    posts.post_id
DESC`

    ;[rows] = await db.query(sql)
    // 👇 如果要在後端修改時間格式，可以參考下面 dayjs 套件寫法，我的做法是在前端用 moment 修改時間輸出格式
    // rows.forEach(i => {
    //   i.reserve_date = dayjs(i.reserve_date).format("YYYY-MM-DD")
    // })
    // ☝️用 dayjs 改變時間格式

    const sql_comments = `SELECT
    comments.*,
    member.images,
    member.member_name
FROM
    comments
JOIN member ON member.member_id = comments.member_id`
    ;[comments] = await db.query(sql_comments)
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows, comments }
  return res.json(output)
})

router.post("/", (req, res) => {})

module.exports = router
