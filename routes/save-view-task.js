const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
// const upload = require(__dirname + "/../modules/img-upload");
const previewInitImg = require(__dirname + "/../modules/itinerary-img-preview");
const multipartParser = previewInitImg.none();

router.get("/", async (req, res) => {
  const itin_member = req.query.itin_member;
  console.log('itin_member=>',itin_member)
  const sql=`SELECT d.*, i.name AS itin_name,i.date,i.coverPhoto,i.itin_member_id FROM itinerary AS i LEFT JOIN itinerary_details AS d  ON d.itin_id = i.itin_id where i.itin_id=? ORDER BY d.itin_order ASC`;
  console.log(sql)
  const [rows] = await db.query(sql,[itin_member]);
  console.log('result intin_id=>',rows)
  return res.json(rows);
  // 給予預設值
  // let output = {
  //   redirect: "",
  //   totalRows: 0,
  //   perPage: 4,
  //   totalPages: 0,
  //   page: 1,
  //   rows: [],
  // };
  // const perPage = 5; // 每頁有5筆

  // let page = req.query.page ? parseInt(req.query.page) : 1;
  //  頁數
  // if (!page || page < 1) {
  //   output.redirect = req.baseUrl;
  //   return output;
  // }

  // let where = " WHERE 1 ";

  // const t_sql = `SELECT COUNT(1) totalRows FROM itinerary_details ${where}`; // 總筆數
  // const [[{ totalRows }]] = await db.query(t_sql);
  // let totalPages = 0;
  // let rows = [];
  // if (totalRows) {
  //   totalPages = Math.ceil(totalRows / perPage);
  //   if (page > totalPages) {
  //     output.redirect = req.baseUrl + "?page=" + totalPages;
  //     return output;
  //   }
  //   const sql = ` SELECT * FROM itinerary_details ${where} LIMIT ${
  //     perPage * (page - 1)
  //   }, ${perPage}`;
  //   [rows] = await db.query(sql);
  // }
  // output = { ...output, totalRows, perPage, totalPages, page, rows };
  // return res.json(output);

  // const sql = `SELECT * FROM itinerary_details ORDER BY itin_order ASC`;

});

// 處理前端發送的陣列物件，新增行程
router.post("/", multipartParser,  (req, res) => {
 
   const data=req.body

  if(!data || !Array.isArray(data)){
    return res.status(400).json({error:'無效的請求數據'})
  }
  console.log('req＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝>>>',req.body)



  //billy delete before insert
  const sql = `DELETE FROM itinerary_details WHERE itin_id=?`;
  console.log('itin_id==>',data[0].itin_id)
  const itin_id= data[0].itin_id;
  console.log('delete_sql =>',itin_id)
  //const [result] = db.query(sql, [itin_id]);

    
 // 在資料庫中逐個儲存陣列物件
data.forEach((item)=>{
  const sql =
  "INSERT INTO `itinerary_details` " +
  "(`itin_id`, `itin_order`, `formatted_address`, `lat`, `lng`, `name`, `phone_number`, `weekday_text`, `startdatetime`,`create_at`) " +
  "VALUES (?,?,?,?,?,?,?,?,?,NOW())";
  const values=[
    item.itin_id,
    item.itin_order,
    item.formatted_address,
    item.lat,
    item.lng,
    item.name,
    item.phone_number,
    '"'+item.weekday_text+'"',
    item.startdatetime]

    db.query(sql,values,(error,result)=>{
      if(error){
        console.error('資料儲存失敗',error)
      }else{
        console.log('資料儲存成功！')
      }
    })
  })


 

})




router.get("/edit", async (req, res) => {
  const itin_member = req.query.itin_member;
  console.log('itin_member=>',itin_member)
  const sql=`SELECT * FROM itinerary_details WHERE itin_id=? ORDER BY itin_order ASC`;
  const [rows] = await db.query(sql,[itin_member]);
  return res.json(rows);

})




module.exports = router;
