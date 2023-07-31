const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

const getListData = async (req) => {
  let output = {
    redirect: "",
    totalRows: 0,
    perPage: 25,
    totalPages: 0,
    page: 1,
    rows: [],
  };
  const perPage = 25;
  let keyword = req.query.keyword || "";
  let page = req.query.page ? parseInt(req.query.page) : 1;
  if (!page || page < 1) {
    output.redirect = req.baseUrl;
    return output;
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

  const t_sql = `SELECT COUNT(1) totalRows FROM member_id ${where}`;
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages) {
      output.redirect = req.baseUrl + "?page=" + totalPages;
      return output;
    }
    const sql = ` SELECT * FROM member_id ${where} LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows, keyword };
  return output;
};

// 新增資料的功能
router.post("/add", multipartParser, async (req, res) => {
  // TODO: 要檢查欄位資料

  const sql =
    "INSERT INTO `member`" +
    "(`member_id`, `email`, `password`, `images`, `member_name`, `member_birth`, `id_number`, `gender`, `location`, `height`, `weight`, `zodiac`, `bloodtype`, `smoke`, `alchohol`, `education_level`, `job`, `profile`, `mobile`, `create_at`)" +
    " VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
  let birthday = dayjs(req.body.member_birth);
  if (birthday.isValid()) {
    birthday = birthday.format("YYYY-MM-DD");
  } else {
    birthday = null;
  }
  console.log(birthday);

  const [result] = await db.query(sql, [
    req.body.member_id,
    req.body.email,
    req.body.password,
    req.body.images,
    req.body.member_name,
    birthday,
    req.body.id_number,
    req.body.gender,
    req.body.location,
    req.body.height,
    req.body.weight,
    req.body.zodiac,
    req.body.bloodtype,
    req.body.smoke,
    req.body.alchohol,
    req.body.education_level,
    req.body.job,
    req.body.profile,
    req.body.mobile,
  ]);
  res.json({
    result,
    postData: req.body,
  });
});

// 修改資料的 API
router.put("/:member_id", async (req, res) => {
  let { member_id } = req.params;
  // 先找到那一筆資料
  member_id = parseInt(member_id);
  const [rows] = await db.query(
    `SELECT * FROM member WHERE member_id='${member_id}' `
  );
  if (!rows.length) {
    return res.json({ msg: "編號錯誤" });
  }
  let row = { ...rows[0], ...req.body };

  const sql = `UPDATE \`member\` SET ? WHERE member_id=?`;
  const [result] = await db.query(sql, [row, member_id]);

  res.json({
    success: !!result.changedRows,
    result,
  });
});

// 刪除資料的 API
router.delete("/:member_id", async (req, res) => {
  const { member_id } = req.params;

  const sql = `DELETE FROM member_id WHERE member_id=?`;
  const [result] = await db.query(sql, [member_id]);

  res.json({ ...result, member_id });
  /*
  {
      "fieldCount": 0,
      "affectedRows": 1,
      "insertId": 0,
      "info": "",
      "serverStatus": 2,
      "warningStatus": 0,
      "member_id": "123"
  }
  */
});

module.exports = router;
