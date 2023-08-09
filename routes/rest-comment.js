const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

// 讀取對應餐廳編號的資料
router.post("/", multipartParser, async (req, res) => {
  const sql = `SELECT 
    ResComtID,
    ComtRestId,
    RestName,
    comtMemberId,
    member_name,
    images,
    rating, 
    ComtText
    FROM restcommment
    JOIN member ON restcommment.comtMemberId = member.member_id
    JOIN restaurant ON restcommment.ComtRestId = restaurant.RestID
    WHERE ComtRestId=${req.body.restId}`;
  const [rows] = await db.query(sql);
  res.json(rows);
});

// 新增評論資料
router.post("/addcomment", multipartParser, async (req, res) => {
  const sql = `INSERT INTO restcommment (
        ComtRestId, comtMemberId, rating, ComtText, created_time) VALUES( ?, ?, ?, ?, NOW())`;

  const [result] = await db.query(sql, [
    req.body.RestID,
    req.body.member_id,
    req.body.rating,
    req.body.ComtText,
  ]);

  res.json({
    result,
  });
});
module.exports = router;
