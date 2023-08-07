const express = require("express");
const db = require(__dirname + "/../modules/mysql2");

const router = express.Router();

router.post("/", async (req, res) => {
  let output = {
    rows: [],
  };

  let rows = [];
  if (req.body.memberID) {
    const sql = ` SELECT reserveId, reserve_member_id ,invite_id ,iv_member_id,images,member_name
        FROM reserve
        LEFT JOIN invite_member ON reserve.reserveId=invite_member.reserve_id
        LEFT JOIN member ON invite_member.iv_member_id=member.member_id
        WHERE reserve_member_id=${req.body.memberID}`;
    [rows] = await db.query(sql);

    output = { ...output, rows };

    return res.json(output);
  }
});

module.exports = router;
