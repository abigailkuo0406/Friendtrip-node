const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();

router.get("/", async (req, res) => {
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 25,
    totalPages: 0,
    page: 1,
    rows: [],
  };
  const perPage = 4;
  let page = req.query.page ? parseInt(req.query.page) : 1;

  let where = " WHERE 1 ";

  const t_sql = `SELECT COUNT(1) totalRows FROM public_itinerary ${where}`;
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);

    // ===========================================================

    const sql = `SELECT * FROM public_itinerary WHERE 1`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows };
  return res.json(output);
});

module.exports = router;
