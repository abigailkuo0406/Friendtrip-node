const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();


router.get("/", async (req, res) => {
  let output = {
    totalRows: 0,
    rows: [],
  };

  const t_sql = `SELECT COUNT(1) totalRows FROM restaurant_meal WHERE 1`;
  const [[{ totalRows }]] = await db.query(t_sql);
  let rows = [];

  const sql = ` SELECT * FROM restaurant_meal WHERE 1`;
  [rows] = await db.query(sql);

  output = {
    ...output,
    totalRows,
    rows,
  };

  return res.json(output);
});
module.exports = router;
