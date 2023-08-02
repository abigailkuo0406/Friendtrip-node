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
    const sql = `SELECT
    posts.post_id,
    posts.member_id,
    posts.img,
    posts.content,
    posts.created_at,
    media_attachments.file_url
FROM
    posts
LEFT JOIN media_attachments ON posts.post_id = media_attachments.post_id
LEFT JOIN member ON posts.member_id = member.member_id
ORDER BY
    posts.created_at
DESC`

    // const sql = `SELECT * FROM posts INNER JOIN media_attachments on posts.post_id = media_attachments.post_id INNER JOIN member on posts.member_id = member.member_id `
    // ${where} LIMIT ${perPage * (page - 1)}, ${perPage}
    ;[rows] = await db.query(sql)
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows }
  return res.json(output)
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
