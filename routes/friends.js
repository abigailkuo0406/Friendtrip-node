const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

router.post("/", async (req, res) => {
  const sql = `SELECT 
  memberId,
  FriendId,
  member_name,images
  FROM friends
  INNER JOIN member ON friends.FriendId = member.member_id
  WHERE memberId = ${req.body.memberID} && acceptState=0`;
  const [rows] = await db.query(sql);
  res.json({ all: rows });
});

// 修改好友狀態(接受邀請)
router.put("/edit", multipartParser, async (req, res) => {
  const memberId = req.body.memberID;
  const FriendId = req.body.FriendId;

  // 修改指定好友關係
  const sql = `UPDATE friends SET acceptState=1 WHERE memberId=${memberId} && FriendId=${FriendId}`;
  const [result1] = await db.query(sql);


  res.json({
    edit: result1,
    postData: req.body,
  });
});

// 刪除好友(拒絕好友邀請)
router.delete("/delete", multipartParser, async (req, res) => {
  const memberId = req.body.memberID;
  const FriendId = req.body.FriendId;
  const sql = `DELETE FROM friends WHERE friends.memberId =${memberId} AND friends.FriendId = ${FriendId}`
  const [result] = await db.query(sql)
  res.json({
    result: result,
  });
})

module.exports = router;
