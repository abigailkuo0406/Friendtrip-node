const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();
const app = express();

router.post("/deleteTempProduct", async (req, res) => {
  let delete_temp_sql = `DELETE FROM product_checking_item WHERE order_id = '${req.body.orderID}'`;
  const [rows_delete] = await db.query(delete_temp_sql);
});

router.post("/getProduct", async (req, res) => {
  const getProduct_sql = `SELECT product_checking_item.*, products.* FROM product_checking_item
    INNER JOIN products ON product_checking_item.product_id = products.product_id WHERE product_checking_item.order_id = '${req.body.orderID}'`;
  const [rows] = await db.query(getProduct_sql);
  res.json({ all: rows });
});

router.post("/goCheckOut", async (req, res) => {
  const addOrder_order_sql = `INSERT INTO product_order (order_id, member_id, receiver_gender, receiver_name, receiver_tel, receiver_address, receiver_email, order_note, payment_method)
    VALUES ('${req.body.orderID}', ${req.body.memberID}, '${req.body.receiverGender}', '${req.body.receiverName}', '${req.body.receiverTel}', '${req.body.receiverAddress}', '${req.body.receiverEmail}', '${req.body.orderNote}', '${req.body.paymentMethod}')`;
  const [rows_order] = await db.query(addOrder_order_sql);
  const addOrder_credit_sql = `INSERT INTO product_order_credit (order_id, credit_number, credit_security, credit_name, credit_ex)
    VALUES ('${req.body.orderID}', '${req.body.creditNumber}', '${req.body.creditSecurity}', '${req.body.creditName}', '${req.body.creditEx}')`;
  const [rows_credit] = await db.query(addOrder_credit_sql);
  let cart_delete_sql = `DELETE FROM cart WHERE cart_check = ${true} AND member_id = ${
    req.body.memberID
  }`;
  const [rows_delete] = await db.query(cart_delete_sql);
});

module.exports = router;
