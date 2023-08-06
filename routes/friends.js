const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();

router.post("/", async (req, res) => {
  const sql = `SELECT memberId,FriendId,member_name,images FROM friends INNER JOIN member ON friends.FriendId = member.member_id WHERE memberId = ${req.body.memberID}`;
  const [rows] = await db.query(sql);
  res.json({ all: rows });
});
// router.get("/", async (req, res) => {
//   let output = {
//     totalRows: 0,
//     rows: [],
//   };
//   const t_sql = `SELECT COUNT(1) totalRows FROM friends WHERE 1`;
//   const [[{ totalRows }]] = await db.query(t_sql);
//   let rows = [];

//   const sql = ` SELECT memberId,FriendId,member_name,images FROM friends INNER JOIN member
//     ON friends.FriendId = member.member_id WHERE memberId=1`;

//   [rows] = await db.query(sql);

//   output = {
//     ...output,
//     totalRows,
//     rows,
//   };
//   return res.json(output);
// });
module.exports = router;
