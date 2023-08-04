const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();
const app = express();

router.post("/findCollection", async (req, res) => {
  if (req.body.productID == undefined) {
    const findCollection_sql = `SELECT * FROM product_collection WHERE member_id = ${req.body.memberID}`;
    const [rows] = await db.query(findCollection_sql);
    res.json({ all: rows });
  } else if (req.body.productID != undefined) {
    const findCollection_sql = `SELECT * FROM product_collection WHERE member_id = ${req.body.memberID} AND product_id = ${req.body.productID}`;
    const [rows] = await db.query(findCollection_sql);
    res.json({ all: rows });
  }
});

router.post("/findCollectionList", async (req, res) => {
  const findCollectionList_sql = `SELECT product_collection.*, products.* FROM product_collection
    INNER JOIN products ON product_collection.product_id = products.product_id WHERE product_collection.member_id = '${req.body.memberID}'`;
  const [rows] = await db.query(findCollectionList_sql);
  res.json({ all: rows });
});

router.post("/addCollection", async (req, res) => {
  const addCollection_sql = `INSERT INTO product_collection (member_id, product_id)
  SELECT ${req.body.memberID}, ${req.body.productID}
  WHERE NOT EXISTS (
    SELECT 1 FROM product_collection
    WHERE member_id = ${req.body.memberID} AND product_id = ${req.body.productID}
  )`;
  const [rows] = await db.query(addCollection_sql);
  res.json({ all: rows });
});

router.post("/deleteCollection", async (req, res) => {
  let deleteCollection_sql = `DELETE FROM product_collection WHERE member_id = ${req.body.memberID} AND product_id = ${req.body.productID}`;

  const [rows] = await db.query(deleteCollection_sql);
  res.json({ all: rows });
});

module.exports = router;
