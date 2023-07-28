const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();
const app = express();

router.get("/", async (req, res) => {
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 25,
    totalPages: 0,
    page: 1,
    rows: [],
  };
  const perPage = 9;
  let keyword = req.query.keyword || "";
  let page = req.query.page ? parseInt(req.query.page) : 1;
  if (!page || page < 1) {
    output.redirect = req.baseUrl;
    return res.json(output);
  }

  let where = " WHERE 1 ";
  if (keyword) {
    const kw_escaped = db.escape("%" + keyword + "%");
    where += ` AND ( 
          \`name\` LIKE ${kw_escaped} 
          OR
          \`address\` LIKE ${kw_escaped}
          )
        `;
  }

  const t_sql = `SELECT COUNT(1) totalRows FROM products ${where}`;
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages) {
      output.redirect = req.baseUrl + "?page=" + totalPages;
      return res.json(output);
    }

    const sql = ` SELECT * FROM products ${where} LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows, keyword };
  return res.json(output);
});

router.post("/cart", async (req, res) => {
  const { member_id } = req.body.auth; // req.body.auth.member_id 可縮短成 member_id
  const checkAll_sql = `UPDATE cart SET cart_check = ${true} WHERE member_id = ${member_id}`;
  const [rows1] = await db.query(checkAll_sql);
  const selectPriceAll_sql = `SELECT cart.product_num,cart.product_id, cart.cart_total,cart.cart_check, products.product_id, products.product_price FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
  const [rowsSelectPriceAll] = await db.query(selectPriceAll_sql);
  let totalPrice = 0.0;
  if (rowsSelectPriceAll.length > 0) {
    rowsSelectPriceAll.forEach((e, i) => {
      if (rowsSelectPriceAll[i].cart_check == true) {
        totalPrice +=
          parseInt(rowsSelectPriceAll[i].product_num) *
          parseInt(rowsSelectPriceAll[i].product_price);
      }
    });
    const setTotalPrice_sql = `UPDATE cart SET cart_total = ${totalPrice} WHERE member_id = ${member_id}`;
    const [rowsSetTotalPrice] = await db.query(setTotalPrice_sql);
    const cart_sql = `SELECT cart.product_id, cart.member_id, cart.product_num, cart.cart_created, cart.cart_total, products.product_id, products.product_name, products.product_price, products.product_brief, products.product_main_img FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
    const [rows5] = await db.query(cart_sql);
    console.log("通過通過");
    res.json({ all: rows5 });
  }
});

router.post("/cart/change", async (req, res) => {
  const product_num = req.body.value;
  const product_id = req.body.name;
  const member_id = req.body.member;
  const cart_check = req.body.check;
  const cart_all_check = req.body.allCheck;
  const [rows] = [];
  if (req.body.value != undefined) {
    const cart_change_sql = `UPDATE cart SET product_num = ${product_num} WHERE member_id = ${member_id} AND product_id = ${product_id}`;
    const [rows] = await db.query(cart_change_sql);
  } else if (req.body.check != undefined) {
    const cart_change_sql = `UPDATE cart SET cart_check = ${cart_check} WHERE member_id = ${member_id} AND product_id = ${product_id}`;
    const [rows] = await db.query(cart_change_sql);
  } else if (req.body.allCheck != undefined) {
    const cart_change_sql = `UPDATE cart SET cart_check = ${cart_all_check} WHERE member_id = ${member_id}`;
    const [rows] = await db.query(cart_change_sql);
  }
  const selectPriceAll_sql = `SELECT cart.product_num,cart.product_id, cart.cart_total,cart.cart_check, products.product_id, products.product_price FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
  const [rowsSelectPriceAll] = await db.query(selectPriceAll_sql);
  let totalPrice = 0.0;
  if (rowsSelectPriceAll.length > 0) {
    rowsSelectPriceAll.forEach((e, i) => {
      if (rowsSelectPriceAll[i].cart_check == true) {
        totalPrice +=
          parseInt(rowsSelectPriceAll[i].product_num) *
          parseInt(rowsSelectPriceAll[i].product_price);
      }
    });
    const setTotalPrice_sql = `UPDATE cart SET cart_total = ${totalPrice} WHERE member_id = ${member_id}`;
    const [rowsSetTotalPrice] = await db.query(setTotalPrice_sql);
    const cart_sql = `SELECT cart.product_id, cart.member_id, cart.product_num, cart.cart_created, cart.cart_total, products.product_id, products.product_name, products.product_price, products.product_brief, products.product_main_img FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
    const [rows5] = await db.query(cart_sql);
    res.json({ all: rows5 });
  }
});
router.post("/cart/delete", async (req, res) => {
  const member_id = req.body.member;
  const product_id = req.body.product;
  const cart_delete_sql = `DELETE FROM cart WHERE member_id = ${member_id} AND product_id = ${product_id}`;
  const [rows] = await db.query(cart_delete_sql);
  const selectPriceAll_sql = `SELECT cart.product_num,cart.product_id, cart.cart_total,cart.cart_check, products.product_id, products.product_price FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
  const [rowsSelectPriceAll] = await db.query(selectPriceAll_sql);
  let totalPrice = 0.0;
  if (rowsSelectPriceAll.length > 0) {
    rowsSelectPriceAll.forEach((e, i) => {
      if (rowsSelectPriceAll[i].cart_check == true) {
        totalPrice +=
          parseInt(rowsSelectPriceAll[i].product_num) *
          parseInt(rowsSelectPriceAll[i].product_price);
      }
    });
    const setTotalPrice_sql = `UPDATE cart SET cart_total = ${totalPrice} WHERE member_id = ${member_id}`;
    const [rowsSetTotalPrice] = await db.query(setTotalPrice_sql);
    const cart_sql = `SELECT cart.product_id, cart.member_id, cart.product_num, cart.cart_created, cart.cart_total, products.product_id, products.product_name, products.product_price, products.product_brief, products.product_main_img FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
    const [rows5] = await db.query(cart_sql);
    res.json({ all: rows5 });
  }
});
router.post("/cart/add", async (req, res) => {
  const output = {};
  const member_id = req.body.member;
  const product_id = req.body.productID;
  const product_in_num = req.body.productNum;
  const cart_add_sql = `SELECT * FROM cart WHERE member_id = ${member_id} AND product_id = ${product_id}`;
  const [rows] = await db.query(cart_add_sql);
  const now = dayjs(new Date());
  if (rows.length > 0) {
    //原本購物車就有此商品，修改數量
    let product_change_num =
      parseInt(product_in_num) + parseInt(rows[0].product_num);
    if (product_change_num < 1) {
      product_change_num = 1;
    }
    const cart_editNum = `UPDATE cart
    SET product_num = ${product_change_num}
    WHERE member_id = ${member_id} AND product_id = ${product_id}`;
    const [rows1] = await db.query(cart_editNum);
  } else {
    //原本購物車沒有此商品，新增商品
    const cart_addItem = `INSERT INTO cart (member_id, product_id, product_num)
    VALUES (${member_id}, ${product_id}, ${product_in_num})`;
    const [rows2] = await db.query(cart_addItem);
  }

  const selectPriceAll_sql = `SELECT cart.product_num,cart.product_id, cart.cart_total,cart.cart_check, products.product_id, products.product_price FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
  const [rowsSelectPriceAll] = await db.query(selectPriceAll_sql);
  let totalPrice = 0.0;
  if (rowsSelectPriceAll.length > 0) {
    rowsSelectPriceAll.forEach((e, i) => {
      if (rowsSelectPriceAll[i].cart_check == true) {
        totalPrice +=
          parseInt(rowsSelectPriceAll[i].product_num) *
          parseInt(rowsSelectPriceAll[i].product_price);
      }
    });
    const setTotalPrice_sql = `UPDATE cart SET cart_total = ${totalPrice} WHERE member_id = ${member_id}`;
    const [rowsSetTotalPrice] = await db.query(setTotalPrice_sql);
    const cart_sql = `SELECT cart.product_id, cart.member_id, cart.product_num, cart.cart_created, cart.cart_total, products.product_id, products.product_name, products.product_price, products.product_brief, products.product_main_img FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE member_id=${member_id} ORDER BY cart.cart_created ASC`;
    const [rows5] = await db.query(cart_sql);
    res.json({ all: rows5 });
  }
});
router.get("/:product_post", async (req, res) => {
  const output = {
    success: false,
    error: "",
    row: null,
  };
  const product_post_value = req.params.product_post;
  if (!product_post_value) {
    // 沒有 sid
    output.error = req.params.product_post;
  } else {
    // alert(product_post);
    const p_sql = `SELECT * FROM products WHERE product_post='${product_post_value}'`;
    const [rows] = await db.query(p_sql);

    if (rows.length) {
      output.success = true;
      output.row = rows[0];
    } else {
      // 沒有資料
      output.error = "沒有資料!";
    }
  }
  return res.json(output);
});

router.post("/cart/checking", async (req, res) => {
  const member_id = req.body.member;
  const checking_sql = `SELECT cart.*, member.* ,products.* FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE cart.member_id=${member_id} AND cart.cart_check=${true} INNER JOIN member ON cart.member_id = member.member_id WHERE cart.member_id=${member_id} AND cart.cart_check=${true}`;
  const [rows] = await db.query(checking_sql);
  res.json({ all: rows });
});
/**/
module.exports = router;
