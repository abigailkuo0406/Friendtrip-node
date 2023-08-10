const express = require("express")
const db = require(__dirname + "/../modules/mysql2")
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
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows, comments }
  return res.json(output)
})

router.post("/add-a-comment", async (req, res) => {
  const allComments = req.leaveMsg // 是這樣接收 post 進來的信息嗎 ?
  const member_id = req.member_id

  console.log(req)
  const sql_comments = `INSERT INTO comments ( member_id, post_id, content, created_at) VALUES ( ?, ?, ?, NOW());`
  ;[comments] = await db.query(sql_comments, [req.body.member_id, req.body.post_id, req.body.leaveMsg])

  return res.json({ message: "success" })
})

module.exports = router
