const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();


router.post("/", async (req, res) => {
  //給予預設值
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 3,
    totalPages: 0,
    page: 1,
    rows: [],
  };
  const perPage = 4 //每頁有４筆

  let page = req.query.page ? parseInt(req.query.page) : 1;

  let where = " WHERE 1 ";
 
 

  const t_sql = `SELECT COUNT(1) totalRows FROM itinerary ${where}`//總筆數
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
 
    const sql = ` SELECT * FROM itinerary ${where} LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows };
  return res.json(output);
});

// 新增資料的功能
router.post('/',async(req,res)=>{

  //TODO:要檢查的欄位
  const sql="INSERT INTO `itinerary`"+ "(`itin_id`, `img`, `date`, `name`, `description`, `public`, `ppl`, `member_id`, `note`, `create_at`)"+ "VALUES (?,?,?,?,?,?,?,?,?,NOW())"


  const[result]=await db.query(sql,[
    req.body.img,
    req.body.name,
    req.body.date,
    req.body.description,
  ])

  res.json({
    result,
    postData:req.body
  })


})

module.exports = router;
