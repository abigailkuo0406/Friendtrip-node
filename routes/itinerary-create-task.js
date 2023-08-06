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
  console.log("this one");
  const perPage = 4; // 每頁有5筆

  let page = req.query.page ? parseInt(req.query.page) : 1;
  //  頁數
  if (!page || page < 1) {
    output.redirect = req.baseUrl;
    return output;
  }
  
  const member_id=req.query.member_id
  const filtercondition=req.query.filtercondition
  console.log('create-task-get:',filtercondition)

  // let where = " WHERE 1 ";
  let t_sql=''
  // const t_sql = `SELECT COUNT(1) totalRows FROM itinerary ${where}`; // 總筆數
  if (filtercondition==''){
    console.log('count() 全部')
    t_sql=`select COUNT(1) totalRows from (SELECT * FROM itinerary where itin_member_id=? union all SELECT i.* FROM itinerary AS i left join public_itinerary AS p on i.itin_id=p.itin_id where p.member_id=?  ) result  `
  }else if(filtercondition=='public'){
    console.log('count()公開')
    t_sql=`select COUNT(1) totalRows from itinerary where itin_member_id=? and public='公開'`
  }else if(filtercondition=='private'){
    console.log('count()不公開')
    t_sql=`select COUNT(1) totalRows from itinerary where itin_member_id=? and public='不公開'`
  }else if(filtercondition=='join'){
    console.log('count()跟團')
    t_sql=`select COUNT(1) totalRows from (SELECT i.* FROM itinerary AS i left join public_itinerary AS p on i.itin_id=p.itin_id where p.member_id=?) result`
  }

  const [[{ totalRows }]] = await db.query(t_sql,[member_id,member_id]);


  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages) {
      output.redirect = req.baseUrl + "?page=" + totalPages;
      return output;
    }
    
    let sql=''
    if (filtercondition==''){
      console.log('RAW 全部')
      sql = `select result.* from (SELECT * FROM itinerary where itin_member_id=? union all SELECT i.* FROM itinerary AS i left join public_itinerary AS p on i.itin_id=p.itin_id where p.member_id=?  ) result  order by result.itin_id LIMIT ${
        perPage * (page - 1)
      }, ${perPage}`;

    }else if(filtercondition=='public'){
      console.log('RAW 公開')
      sql = `select * from itinerary where itin_member_id=? and public='公開' LIMIT ${
        perPage * (page - 1)
      }, ${perPage}`;    

    }else if(filtercondition=='private'){
      console.log('RAW 不公開')
      sql = `select * from itinerary where itin_member_id=? and public='不公開' LIMIT ${
        perPage * (page - 1)
      }, ${perPage}`;    

    }else if(filtercondition=='join'){
      console.log('RAW join')
      sql = `select result.* from (SELECT i.* FROM itinerary AS i left join public_itinerary AS p on i.itin_id=p.itin_id where p.member_id=?  ) result  order by result.itin_id LIMIT ${
        perPage * (page - 1)
      }, ${perPage}`;    
    }
    
    [rows] = await db.query(sql,[member_id,member_id]);
  
    
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows };
  // console.log('output=>',output)

  return res.json(output);
});

// 新增資料的功能
router.post("/", multipartParser, async (req, res) => {
  console.log(req)
  // TODO: 要檢查的欄位
  const sql =
    "INSERT INTO `itinerary` " +
    "(`itin_member_id`, `coverPhoto`, `name`, `date`, `description`, `public`, `ppl`, `note`, `time`, `create_at`) " +
    "VALUES (?,?,?,?,?,?,?,?,?,NOW())";

  const [result] = await db.query(sql, [
    req.body.itin_member_id,
    req.body.coverPhoto,
    req.body.name,
    req.body.date,
    req.body.description,
    req.body.public,
    req.body.ppl,
    req.body.note,
    req.body.time,
  ]);
  res.json({
    result,
    postData: req.body,
  });
});

// 刪除行程紀錄資料的API
router.delete("/:itin_id", async (req, res) => {
  const { itin_id } = req.params;
  const sql = `DELETE FROM itinerary WHERE itin_id=?`;
  const [result] = await db.query(sql, [itin_id]);
  res.json({ ...result, itin_id });
});

//篩選公開與不公開
router.get("/public-itineraries", async (req, res) => {
  const sql = `SELECT * FROM itinerary WHERE public ='公開'`;
  const [rows] = await db.query(sql);
  return res.json(rows);
});
module.exports = router;
