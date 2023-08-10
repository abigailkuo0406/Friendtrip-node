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

// ==========================================
// app.delete("/posts/:post_id/:member_id", (req, res) => {
//   const post_id = req.params.post_id
//   const member_id = req.params.member_id

// Your deletion logic here

//   res.status(200).send("Post deleted successfully")
// })

// ==========================================

router.post("/delete-this-post", async (req, res) => {
  console.log("deletePost", req.body)
  // const sql_comments = `INSERT INTO comments ( member_id, post_id, content, created_at) VALUES ( ?, ?, ?, NOW());`
  const sql_comments = `DELETE FROM posts WHERE post_id = ? AND member_id = ?;`
  ;[comments] = await db.query(sql_comments, [req.body.post_id, req.body.postMember_id])

  return res.json({ message: "deleted" })
})

module.exports = router
