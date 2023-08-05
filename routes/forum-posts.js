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
    const sql = `SELECT
    posts.post_id,
    posts.member_id,
    posts.img,
    posts.content,
    posts.created_at            
FROM
    posts
LEFT JOIN member ON posts.member_id = member.member_id
ORDER BY
    posts.created_at
DESC`

    ;[rows] = await db.query(sql)

    const sql_comments = `SELECT
        comments. *, member.images
      FROM
          comments
      JOIN member ON member.member_id=comments.member_id`
    ;[comments] = await db.query(sql_comments)
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows, comments }
  return res.json(output)
})

module.exports = router
