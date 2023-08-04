const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();
const app = express();

router.post("/normal", async (req, res) => {
  const findNormalOrder_sql = `SELECT product_order.*, product_order_credit.* FROM product_order
    INNER JOIN product_order_credit ON product_order.order_id = product_order_credit.order_id
    WHERE product_order.member_id = ${req.body.memberID}
   `;
  const [rows_order] = await db.query(findNormalOrder_sql);
  const findNormalProduct_sql = `SELECT product_order.order_id, product_order.member_id, product_checking_item.*, products.* FROM product_order
    INNER JOIN product_checking_item ON product_order.order_id = product_checking_item.order_id
    INNER JOIN products ON product_checking_item.product_id = products.product_id
    WHERE product_order.member_id = ${req.body.memberID}
   `;
  const [rows_product] = await db.query(findNormalProduct_sql);
  res.json({ order: rows_order, product: rows_product });
});

module.exports = router;
