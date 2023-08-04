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

  const perPage = 2; //一頁幾筆資料

  //取得queryString查詢條件
  let city = req.query.city || "";
  let meal = req.query.meal || "";

  let page = req.query.page ? parseInt(req.query.page) : 1; //第幾頁

  // 如果page是NaN或小於1的數字，將頁面導向當前路徑的URL(http://localhost:3002/restaurant)
  if (!page || page < 1) {
    // output.redirect = req.baseUrl;
    // return res.json(output);
    return res.redirect(req.baseUrl);
  }

  let where = " WHERE 1 ";

  //設定有關鍵字時，SQL查詢語法
  if (city || meal) {
    const city_escaped = db.escape("%" + city + "%");
    const meal_escaped = db.escape("%" + meal + "%");

    where += ` AND (
          \`RestArea\` LIKE ${city_escaped}
          AND
          \`RestMeal\` LIKE ${meal_escaped}
          )
        `;
  }

  const t_sql = `SELECT COUNT(1) totalRows FROM restaurant ${where}`; // 查詢資料總數
  const [[{ totalRows }]] = await db.query(t_sql); //總筆數
  let totalPages = 0; //總頁數
  let rows = []; //資料陣列

  //有資料才進行以下(當總筆數為真)
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage); //總頁數=總筆數/每頁幾筆資料(無條件進位)

    // 若當前頁碼超過總頁數，將頁面導向至最後一頁
    if (page > totalPages) {
      // output.redirect = req.baseUrl + "?page=" + totalPages;
      // return res.json(output);
      return res.redirect(req.baseUrl + "?page=" + totalPages);
    }

    //查詢限制筆數的資料
    const sql = ` SELECT * FROM restaurant ${where} LIMIT ${perPage * (page - 1)
      }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows, jwtData: res.locals.jwtData };
  return res.json(output);
  // res.json({ totalRows, totalPages, page, perPage, rows });
});


// 新增訂位資料
router.post("/", multipartParser, async (req, res) => {
  const sql =
    "INSERT INTO `reserve`" +
    "(`reserve_member_id`, `rest_id`, `reserve_date`, `reserve_time`, `reserve_people`, `created_time`)" +
    " VALUES ( ?, ?, ?, ?, ?, NOW())";

  // req.body 是透過 multipartParser 解析後的物件，包含客戶端 POST 請求中所攜帶的資料。在這段程式碼中，使用了 req.body 來獲取客戶端提交的 member_id, rest_id, reserve_date, reserve_time, reserve_people 等欄位的值，並將這些值作為參數傳遞給 SQL 查詢中的問號佔位符，完成資料庫插入操作。
  const [result1] = await db.query(sql, [
    req.body.member_id,
    req.body.rest_id,
    req.body.reserve_date,
    req.body.reserve_time,
    req.body.reserve_people,
  ]);

  // res.json(req.body);
  res.json({
    result1,
    postData: req.body,
  });

  // 新增邀請好友資料;
  const sql2 =
    "INSERT INTO `invite_member`" +
    "(`reserve_id`, `iv_member_id`, `created_time`)" +
    " VALUES ( ?, ?, NOW())";

  if (req.body.iv_member_id) {
    const ivListLength = req.body.iv_member_id.length;
    for (let i = 0; i < ivListLength; i++) {
      const [result2] = await db.query(sql2, [
        result1.insertId,
        req.body.iv_member_id[i],
      ]);
    }
  }
});

module.exports = router;
