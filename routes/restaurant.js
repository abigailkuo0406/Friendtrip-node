const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
// const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

router.get("/", async (req, res) => {
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 25,
    totalPages: 0,
    page: 1,
    rows: [],
  };
  const perPage = 1;
  // let keyword = req.query.keyword || "";
  let page = req.query.page ? parseInt(req.query.page) : 1;
  // if (!page || page < 1) {
  //   output.redirect = req.baseUrl;
  //   return res.json(output);
  // }

  let where = " WHERE 1 ";
  // if (keyword) {
  //   const kw_escaped = db.escape("%" + keyword + "%");
  //   where += ` AND (
  //         \`bookname\` LIKE ${kw_escaped}
  //         OR
  //         \`author\` LIKE ${kw_escaped}
  //         )
  //       `;
  // }

  const t_sql = `SELECT COUNT(1) totalRows FROM restaurant ${where}`;
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    // if (page > totalPages) {
    //   output.redirect = req.baseUrl + "?page=" + totalPages;
    //   return res.json(output);
    // }
    const sql = ` SELECT * FROM restaurant ${where} LIMIT ${perPage * (page - 1)
      }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows };
  return res.json(output);
});

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
//     const sql = `SELECT * FROM products WHERE sid=${book_sid}`;
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

// 新增訂位資料
router.post("/", multipartParser, async (req, res) => {
  const sql = "INSERT INTO `reserve`" +
    "(`member_id`, `rest_id`, `reserve_date`, `reserve_time`, `reserve_people`, `created_time`)" +
    " VALUES ( ?, ?, ?, ?, ?, NOW())";


  // req.body 是透過 multipartParser 解析後的物件，包含客戶端 POST 請求中所攜帶的資料。在這段程式碼中，使用了 req.body 來獲取客戶端提交的 member_id, rest_id, reserve_date, reserve_time, reserve_people 等欄位的值，並將這些值作為參數傳遞給 SQL 查詢中的問號佔位符，完成資料庫插入操作。
  const [result1] = await db.query(sql, [
    req.body.member_id,
    req.body.rest_id,
    req.body.reserve_date,
    req.body.reserve_time,
    req.body.reserve_people,
  ])

  // res.json(req.body);
  res.json({
    result1,
    postData: req.body
  })

  // 新增邀請好友資料
  const sql2 = "INSERT INTO `invite_member`" +
    "(`reserve_id`, `iv_member_id`, `created_time`)" +
    " VALUES ( ?, ?, NOW())";

  const ivListLength = req.body.iv_member_id.length
  for (let i = 0; i < ivListLength; i++) {
    const [result2] = await db.query(sql2, [
      result1.insertId,
      req.body.iv_member_id[i],

    ])
  }

});

module.exports = router;
