const { application, query, response } = require("express");
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
  console.log('this one')
  const perPage = 5; // 每頁有5筆

  let page = req.query.page ? parseInt(req.query.page) : 1;
  //  頁數
  if (!page || page < 1) {
    output.redirect = req.baseUrl;
    return output;
  }

  let where = " WHERE 1 ";

  const t_sql = `SELECT COUNT(1) totalRows FROM itinerary ${where}`; // 總筆數
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages) {
      output.redirect = req.baseUrl + "?page=" + totalPages;
      return output;
    }
    const sql = ` SELECT * FROM itinerary ${where} LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows };
  return res.json(output);
});



// 新增資料的功能
router.post("/", multipartParser, async (req, res) => {
  // TODO: 要檢查的欄位
  const sql =
    "INSERT INTO `itinerary` " +
    "(`itin_member_id`, `coverPhoto`, `name`, `date`, `description`, `public`, `ppl`, `note`, `create_at`) " +
    "VALUES (?,?,?,?,?,?,?,?,NOW())";

  const [result] = await db.query(sql, [
    req.body.itin_member_id,
    req.body.coverPhoto,
    req.body.name,
    req.body.date,
    req.body.description,
    req.body.public,
    req.body.ppl,
    req.body.note,
  ]);
  res.json({
    result,
    postData: req.body,
  })});

 
  // 刪除行程紀錄資料的API
router.delete("/:itin_id", async (req, res) => {
    const { itin_id } = req.params;
    const sql = `DELETE FROM itinerary WHERE itin_id=?`;
    const [result] = await db.query(sql, [itin_id]);
    res.json({ ...result, itin_id })
});



module.exports = router;
