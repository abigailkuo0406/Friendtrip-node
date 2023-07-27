const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
// const upload = require(__dirname + "/../modules/img-upload");
const previewInitImg = require(__dirname + "/../modules/itinerary-img-preview");
const multipartParser = previewInitImg.none();

router.get("/", async (req, res) => {
  // 給予預設值
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 4,
    totalPages: 0,
    page: 1,
    rows: [],
  };
  const perPage = 5; // 每頁有5筆

  let page = req.query.page ? parseInt(req.query.page) : 1;
  //  頁數
  if (!page || page < 1) {
    output.redirect = req.baseUrl;
    return output;
  }

  let where = " WHERE 1 ";

  const t_sql = `SELECT COUNT(1) totalRows FROM itinerary_details ${where}`; // 總筆數
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages) {
      output.redirect = req.baseUrl + "?page=" + totalPages;
      return output;
    }
    const sql = ` SELECT * FROM itinerary_details ${where} LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows };
  return res.json(output);
});

// 新增資料的功能
router.post("/", multipartParser, async (req, res) => {

    console.log('req＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝>>>',req.body)
  // TODO: 要檢查的欄位
  const sql =
    "INSERT INTO `itinerary_details` " +
    "(`itin_id`, `itin_order`, `formatted_address`, `lat`, `lng`, `name`, `phone_number`, `weekday_text`, `startdatetime`,`create_at`) " +
    "VALUES (?,?,?,?,?,?,?,?,?,NOW())";

  const weekday=req.body[0].weekday_text;

//TODO: foreach寫進資料庫
  const [result] = await db.query(sql, [
    req.body[0].itin_id,
    req.body[0].itin_order,
    req.body[0].formatted_address,
    req.body[0].lat,
    req.body[0].lng,
    req.body[0].name,
    req.body[0].phone_number,
    '"'+req.body[0].weekday_text+'"',
    req.body[0].startdatetime,
  ]);
  res.json({
    result,
    postData: req.body,
  });
});

module.exports = router;
