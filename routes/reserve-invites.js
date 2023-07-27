const express = require("express");
const db = require(__dirname + "/../modules/mysql2");

const router = express.Router();

router.get("/", async (req, res) => {
  let output = {
    // totalRows: 0,
    rows: [],
  };

  //   const t_sql = `SELECT COUNT(1) totalRows FROM reserve WHERE member_id=3`;
  //   const [[{ totalRows }]] = await db.query(t_sql);

  let rows = [];

  //   if (totalRows) {
  //     totalPages = Math.ceil(totalRows / perPage);

  //     if (page > totalPages) {
  //       return res.redirect(req.baseUrl + "?page=" + totalPages);
  //     }
  const sql = ` SELECT reserveId, reserve_member_id ,invite_id ,iv_member_id,images
        FROM reserve
        LEFT JOIN invite_member ON reserve.reserveId=invite_member.reserve_id
        LEFT JOIN member ON invite_member.iv_member_id=member.member_id
        WHERE reserve_member_id=3`;
  [rows] = await db.query(sql);
  //   }

  output = { ...output, rows };

  return res.json(output);
});

module.exports = router;
