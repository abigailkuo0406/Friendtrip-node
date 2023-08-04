const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

const getListData = async (req) => {
  let output = {
    totalRows: 0,
    perPage: 25,
    totalPages: 0,
    page: 1,
    rows: [],
  };

  const perPage = 10;

  let page = req.query.page ? parseInt(req.query.page) : 1;

  if (!page || page < 1) {
    return res.redirect(req.baseUrl);
  }

  const t_sql = `SELECT COUNT(1) totalRows FROM reserve WHERE reserve_member_id=2`;
  const [[{ totalRows }]] = await db.query(t_sql);

  let totalPages = 0;
  let rows = [];

  
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);

    if (page > totalPages) {
      return res.redirect(req.baseUrl + "?page=" + totalPages);
    }
    const sql = ` SELECT  reserve_member_id, reserveId,rest_id,RestName,RestImg,reserve_date,reserve_time,reserve_people
        FROM reserve
        JOIN restaurant ON reserve.rest_id = restaurant.RestID 
        WHERE reserve_member_id=2
        ORDER BY reserveId DESC
        LIMIT ${perPage * (page - 1)}, ${perPage} `;
    [rows] = await db.query(sql);
  }

  output = { ...output, totalRows, perPage, totalPages, page, rows };

  return output;
};
router.get("/", async (req, res) => {
  let output = await getListData(req);
  output.rows.forEach((i) => {
    i.reserve_date = dayjs(i.reserve_date).format("YYYY-MM-DD");
    // delete i.created_at;
  });
  output = {
    ...output,
    jwtData: res.locals.jwtData,
  };

  res.json(output);
});

router.get("/:reserveRid", async (req, res) => {
  let output = {
    success: false,
    error: "",
    row: null,
  };

  const reserveRid = parseInt(req.params.reserveRid) || 0;
  if (!reserveRid) {
    // 沒有 sid
    output.error = "沒有 rid !";
  } else {
    const sql = `SELECT  reserve_member_id, reserveId,rest_id,RestName,RestImg,reserve_date,reserve_time,reserve_people
    FROM reserve
    JOIN restaurant ON reserve.rest_id = restaurant.RestID
    WHERE reserveId=${reserveRid}`;
    const [rows] = await db.query(sql);

    if (rows.length) {
      output.success = true;
      output.row = rows[0];
      output.row.reserve_date = dayjs(output.row.reserve_date).format("YYYY-MM-DD");
      // delete i.created_at;
      output = {
        ...output,
      };

    } else {
      // 沒有資料
      output.error = "沒有資料 !";
    }
  }
  res.json(output);
});


router.put("/edit", multipartParser, async (req, res) => {
  const reserveRid = req.body.reserve_id;
  const sql = `UPDATE reserve SET reserve_member_id=?,
  rest_id=?,
  reserve_date=?,
  reserve_time=?,
  reserve_people=?
  WHERE reserveId=${reserveRid}`;
  const [result1] = await db.query(sql, [
    req.body.member_id,
    req.body.rest_id,
    req.body.reserve_date,
    req.body.reserve_time,
    req.body.reserve_people,
  ]);
  res.json({
    result1,
    postData: req.body,
  });
});

module.exports = router;
