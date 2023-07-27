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
  const perPage = 4;
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
    const sql = ` SELECT * FROM restaurant ${where} LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows , jwtData: res.locals.jwtData};
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
  const sql =
    "INSERT INTO `reserve`" +
    "(`member_id`, `rest_id`, `reserve_date`, `reserve_time`, `reserve_people`, `created_time`)" +
    " VALUES ( ?, ?, ?, ?, ?, NOW())";

  const [result] = await db.query(sql, [
    req.body.member_id,
    req.body.rest_id,
    req.body.reserve_date,
    req.body.reserve_time,
    req.body.reserve_people,
  ]);

  // res.json(req.body);
  res.json({
    result,
    postData: req.body,
  });
});

module.exports = router;
