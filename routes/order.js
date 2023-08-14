const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();
const app = express();

router.post("/find", async (req, res) => {
  let status = "";
  switch (req.query.status) {
    case "all":
      status = "";
      break;
    case "established":
      status = "AND order_status = '訂單成立'";
      break;
    case "complete":
      status = "AND order_status = '訂單完成'";
      break;
    case "noComment":
      status = "AND order_status = '訂單完成' AND order_comment = false";
      break;
  }
  //查找訂單
  const findNormalOrder_sql = `SELECT product_order.*, product_order_credit.* FROM product_order
    INNER JOIN product_order_credit ON product_order.order_id = product_order_credit.order_id
    WHERE product_order.member_id = ${req.body.memberID} ${status} ORDER BY product_order.complete_time DESC
   `;
  const [rows_order] = await db.query(findNormalOrder_sql);

  //查找訂單商品
  const findNormalProduct_sql = `SELECT product_order.order_id, product_order.member_id, product_checking_item.*, products.* FROM product_order
    INNER JOIN product_checking_item ON product_order.order_id = product_checking_item.order_id
    INNER JOIN products ON product_checking_item.product_id = products.product_id
    WHERE product_order.member_id = ${req.body.memberID}
   `;
  const [rows_product] = await db.query(findNormalProduct_sql);
  res.json({ order: rows_order, product: rows_product });
});

router.post("/orderComplete", async (req, res) => {
  const currentDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const checkAll_sql = `UPDATE product_order SET order_status = '訂單完成', complete_time = '${currentDateTime}' WHERE order_id = '${req.body.orderID}'`;
  const [rows] = await db.query(checkAll_sql);
  res.json({ all: rows });
});

router.post("/writeComment", async (req, res) => {
  const comment = req.body.comment;
  console.log("後端收到的商品評論：", comment);
  let writeComment_sql = "";
  if (comment.length > 0) {
    comment.forEach((element, index) => {
      if (index < comment.length - 1) {
        writeComment_sql += ` (${req.body.memberID}, ${element.product_id}, '${req.body.orderID}', '${element.comment_content}', ${element.comment_rate}),`;
      } else if (index == comment.length - 1) {
        writeComment_sql += ` (${req.body.memberID}, ${element.product_id}, '${req.body.orderID}', '${element.comment_content}', ${element.comment_rate})`;
      }
    });
    // 將評論寫入評論資料表 (product_comment)
    const addComment_sql = `INSERT INTO product_comment (member_id, product_id, order_id, comment_content, comment_rating) VALUES ${writeComment_sql}`;
    console.log("後端存入商品評論的SQL：", addComment_sql);
    const [rows1] = await db.query(addComment_sql);
    // 更新訂單資料表標註已經評論過了 (product_order 的 order_comment)
    const hasComment_sql = `UPDATE product_order SET order_comment = ${true} WHERE order_id = '${
      req.body.orderID
    }'`;
    const [rows2] = await db.query(hasComment_sql);
    res.json({ rows1: rows1, rows2: rows2 });

    let inNumber = "";
    comment.forEach((element, index) => {
      if (index == 0) {
        inNumber += `${element.product_id}`;
      } else {
        inNumber += `,${element.product_id}`;
      }
    });
    const changeRating_sql = `UPDATE products p
    JOIN (
        SELECT product_id, ROUND(AVG(comment_rating), 1) AS avg_rating
        FROM product_comment
        WHERE product_id IN (${inNumber})
        GROUP BY product_id
    ) pc ON p.product_id = pc.product_id
    SET p.product_rate = pc.avg_rating;`;
    const [rowsRating] = await db.query(changeRating_sql);
  }
});

router.post("/getComment", async (req, res) => {
  const getComment_sql = `SELECT product_comment.*, member.member_id, member.member_name,member.images FROM product_comment
    INNER JOIN member ON product_comment.member_id = member.member_id
    WHERE product_id = ${req.body.productID}
   `;
  const [rows] = await db.query(getComment_sql);
  res.json({ all: rows });
});

// 查詢同筆訂單同個商品是否有評論過
router.post("/checkComment", async (req, res) => {
  const checkComment_sql = `SELECT * FROM product_comment WHERE order_id = '${req.body.orderID}'`;
  const [rows] = await db.query(checkComment_sql);
  res.json({ all: rows });
});

module.exports = router;
