const { application, query, response } = require("express");
const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
const previewInitImg = require(__dirname + "/../modules/itinerary-img-preview");
const multipartParser = previewInitImg.none();

router.get("/", async (req, res) => {
  // 給予預設值
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 3,
    totalPages: 0,
    page: 1,
    rows: [],
  };
  console.log("this one");
  const perPage = 6;

  const member_id=req.query.member_id
  console.log("req.query.page:", req.query.page);
  let page = req.query.page ? parseInt(req.query.page) : 1;
  //  頁數
  if (!page || page < 1) {
    output.redirect = req.baseUrl;
    return output;
  }

  let where = "where public='公開'  ";

  const t_sql = `SELECT COUNT(1) totalRows FROM itinerary ${where} and itin_member_id !=${member_id} ` ; // 總筆數
  console.log('t_sql:',t_sql)
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages) {
      output.redirect = req.baseUrl + "?page=" + totalPages;
      return output;
    }
    const sql = `SELECT m.member_name as member_name,m.images as images,a.* FROM itinerary a  left join member m  on a.itin_member_id=m.member_id ${where} and a.itin_member_id ORDER BY a.create_at DESC LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }

  output = { ...output, totalRows, perPage, totalPages, page, rows };
  return res.json(output);
});

// 刪除行程紀錄資料的API
// router.delete("/:itin_id", async (req, res) => {
//   const { itin_id } = req.params;
//   const sql = `DELETE FROM itinerary WHERE itin_id=?`;
//   const [result] = await db.query(sql, [itin_id]);
//   res.json({ ...result, itin_id });
// });

router.post("/join-public", async (req, res) => {
  const sql =
    "INSERT INTO `public_itinerary` " +
    "(`member_id`, `itin_id`,`create_at`) " +
    "VALUES (?,?,Now())";

  const [result] = await db.query(sql, [req.body.member_id, req.body.itin_id]);
  res.json({
    result,
    postData: req.body,
  });
});

// 首頁公開行程輪播
router.get("/home", async (req, res) => {
  const sql = `select m.*,b.* from (select * from itinerary
    WHERE itin_id in (
    select substring_index(GROUP_CONCAT(itin_id order by create_at desc),',',1)  
    from itinerary
    where public='公開'
    GROUP by itin_member_id
        ) 
              )b 
    LEFT join member m
    on m.member_id=b.itin_member_id;`;
  const [rows] = await db.query(sql);
  return res.json(rows);
});


module.exports = router;
