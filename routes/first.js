const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
const upload = require(__dirname + "/../modules/face-upload");
const multipartParser = upload.none();

// 新增資料的功能
router.post("/", multipartParser, async (req, res) => {
  // TODO: 要檢查欄位資料

  const sql =
    "INSERT INTO `datings`" +
    "(`member_id`, `i_gender`, `i_height_low`, `i_height_high`, `i_weight_low`, `i_weight_high`, `i_age_min`, `i_age_max`, `create_at`)" +
    " VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
  const [result] = await db.query(sql, [
    req.body.memberID,
    req.body.i_gender,
    req.body.i_age_min,
    req.body.i_age_max,
    req.body.i_height_low,
    req.body.i_height_high,
    req.body.i_weight_low,
    req.body.i_weight_high,
  ]);
  res.json({
    result,
    postData: req.body,
  });
});

module.exports = router;
