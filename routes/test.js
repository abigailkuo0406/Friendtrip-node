const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();

router.get("/try-db", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM `address_book` LIMIT 2");
    res.json(rows);
  });
module.exports = router;
