const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

// 新增資料的功能
router.post("/", multipartParser, async (req, res) => {
  // TODO: 要檢查欄位資料

  const sql = `SELECT * FROM member WHERE member_id = ${req.body.memberID}`;
  const [result] = await db.query(sql);
  result.forEach((i) => {
    i.member_birth = dayjs(i.member_birth).format("YYYY-MM-DD");
  });
  console.log(result);
  res.json({ all: result });
});

module.exports = router;
