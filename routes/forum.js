const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();

// router.get("/test", async (req, res) => {
//   let sql = `SELECT * FROM products WHERE 1`;

//   let [rows] = await db.query(sql);
//   // console.log(rows);
//   res.json({ rows });
// });

router.get("/", function (req, res, next) {
  res.send("Jesus I Love You!!!");
});

module.exports = router;
