const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

router.post("/", multipartParser, async (req, res) => {
  console.log(req.body.memberId);
  res.json(req.body);
});

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

  const t_sql = `SELECT COUNT(1) totalRows FROM reserve WHERE reserve_member_id=3`;
  const [[{ totalRows }]] = await db.query(t_sql);

  let totalPages = 0;
  let rows = [];

  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);

    if (page > totalPages) {
      return res.redirect(req.baseUrl + "?page=" + totalPages);
    }
    const sql = ` SELECT  reserve_member_id, reserveId,rest_id,RestName,RestImg,reserve_date,reserve_time,reserve_people,invite_id ,iv_member_id 
        FROM reserve
        JOIN restaurant ON reserve.rest_id = restaurant.RestID 
        LEFT JOIN invite_member ON reserve.reserveId=invite_member.reserve_id
        WHERE reserve_member_id=3
        LIMIT ${perPage * (page - 1)}, ${perPage}`;
    [rows] = await db.query(sql);
  }

  output = { ...output, totalRows, perPage, totalPages, page, rows };

  return output;
};
router.get("/", async (req, res) => {
  const output = await getListData(req);
  output.rows.forEach((i) => {
    i.reserve_date = dayjs(i.reserve_date).format("YYYY-MM-DD");
    // delete i.created_at;
  });

  res.json(output);
});

module.exports = router;
