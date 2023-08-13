const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

router.post("/", async (req, res) => {
  let output = {
    totalUnaccepts: 0,
  };
  const t_sql = `SELECT COUNT(1) totalUnaccepts FROM friends WHERE FriendId = ${req.body.memberID} && acceptState=${req.body.acceptState}`; // 查詢好友總數
  const [[{ totalUnaccepts }]] = await db.query(t_sql); //總筆數

  let rows1 = []; //資料陣列
  let rows2 = []; //資料陣列


  const sql1 = `SELECT memberId, FriendId, member_name,images FROM friends INNER JOIN member ON friends.FriendId = member.member_id WHERE memberId = ${req.body.memberID} && acceptState=${req.body.acceptState}`;
  [rows1] = await db.query(sql1);

  const sql2 = `SELECT memberId, FriendId, member_name,images FROM friends INNER JOIN member ON friends.memberId = member.member_id WHERE FriendId = ${req.body.memberID} && acceptState=${req.body.acceptState}`;
  [rows2] = await db.query(sql2);

  const rows = [...rows1, ...rows2]

  output = {
    ...output,
    totalUnaccepts,
    rows,
    rows2
  };
  return res.json(output);

});

// 修改好友狀態(接受邀請)
router.put("/edit", multipartParser, async (req, res) => {
  const memberId = req.body.memberID;
  const FriendId = req.body.FriendId;

  // 修改指定好友關係
  const sql = `UPDATE friends SET acceptState=1 WHERE memberId=${FriendId} && FriendId=${memberId}`;
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
  const sql = `DELETE FROM friends WHERE friends.memberId =${FriendId} AND friends.FriendId = ${memberId}`
  const [result] = await db.query(sql)
  res.json({
    result: result,
  });
})

module.exports = router;
