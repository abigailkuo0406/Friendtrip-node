const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

// 新增資料的功能
router.post("/", multipartParser, async (req, res) => {
  // TODO: 要檢查欄位資料

  const sql = `SELECT
  *,  mb.member_id AS select_id,
    YEAR(CURDATE()) - YEAR(mb.member_birth) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(mb.member_birth, '%m%d')) AS age
  FROM 
    member AS mb
  JOIN 
    datings AS dt
  ON 
    dt.member_id = ${req.body.memberID}
  WHERE
    YEAR(CURDATE()) - YEAR(mb.member_birth) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(mb.member_birth, '%m%d')) < dt.i_age_max AND
    YEAR(CURDATE()) - YEAR(mb.member_birth) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(mb.member_birth, '%m%d')) > dt.i_age_min AND
    mb.gender = dt.i_gender AND
    mb.height < dt.i_height_high AND
    mb.height > dt.i_height_low AND
    mb.weight < dt.i_weight_high AND
    mb.weight > dt.i_weight_low`;

  const [result] = await db.query(sql);
  result.forEach((i) => {
    i.member_birth = dayjs(i.member_birth).format("YYYY-MM-DD");
  });
  console.log(result);
  res.json({ all: result });
});

module.exports = router;
