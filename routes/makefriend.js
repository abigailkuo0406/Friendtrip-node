const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

// 新增資料的功能
router.post("/", multipartParser, async (req, res) => {
  // TODO: 要檢查欄位資料

  const sql =
    "INSERT INTO `friends`" +
    "(`memberId`, `FriendId`, `acceptState`, `create_at`)" +
    " VALUES ( ?, ?, ?, NOW())";

  const [result] = await db.query(sql,
    [
      req.body.memberId,
      req.body.FriendId,
      req.body.acceptState
    ]);
  res.json({
    result,
    postData: req.body,
  });
});

module.exports = router;
