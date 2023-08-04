const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

// 修改資料的 API
router.post("/", multipartParser, async (req, res) => {
  // TODO: 要檢查欄位資料
  const [rows] = await db.query(
    `SELECT * FROM \`member\` WHERE  member_id=${req.body.memberID} `
  );
  if (!rows.length) {
    return res.json({ msg: "編號錯誤" });
  }
  let row = { ...rows[0], ...req.body };
  const sql = `UPDATE \`member\` SET ? WHERE member_id=${req.body.memberID}`;
  const [result] = await db.query(sql, [row, member_id]);
  console.log(result);
  res.json({ all: result });
});

module.exports = router;
