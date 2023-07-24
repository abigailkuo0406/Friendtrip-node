const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
// const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

router.get("/", async (req, res) => {
  let output = {
    totalRows: 0,
    rows: [],
  };

  const t_sql = `SELECT COUNT(1) totalRows FROM area_list WHERE 1`;
  const [[{ totalRows }]] = await db.query(t_sql);
  let rows = [];

  const sql = ` SELECT * FROM area_list WHERE 1`;
  [rows] = await db.query(sql);

  output = {
    ...output,
    totalRows,
    rows,
  };

  return res.json(output);
});
module.exports = router;
