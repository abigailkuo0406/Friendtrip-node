const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

router.get("/", async (req, res) => {
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
      \`member_name\` LIKE ${kw_escaped} 
      OR
      \`location\` LIKE ${kw_escaped}
      )
    `;
  }

  const t_sql = `SELECT COUNT(1) totalRows FROM member ${where}`;
  const [[{ totalRows }]] = await db.query(t_sql);
  let totalPages = 0;
  let rows = [];
  if (totalRows) {
    totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages) {
      output.redirect = req.baseUrl + "?page=" + totalPages;
      return output;
    }
    const sql = ` SELECT * FROM member ${where} LIMIT ${
      perPage * (page - 1)
    }, ${perPage}`;
    [rows] = await db.query(sql);
  }
  output = { ...output, totalRows, perPage, totalPages, page, rows, keyword };
  return res.json(output);
});

router.post("/login", async (req, res) => {
  const output = {
    success: false,
    code: 0,
    error: "",
  };

  if (!req.body.email || !req.body.password) {
    output.error = "欄位資料不足";
    return res.json(output);
  }
  const sql = "SELECT * FROM member WHERE email=?";
  const [rows] = await db.query(sql, [req.body.email]); // 查詢來的需求 (使用者輸入的) email，結果放入 [rows] 內
  if (!rows.length) {
    // 帳號是錯的
    output.code = 402;
    output.error = "找不到此帳號";
    return res.json(output);
  }
  console.log(rows[0].password);
  // const verified = await bcrypt.compare(req.body.password, rows[0].password);
  const verified = rows[0].password === req.body.password; // 測試用，不管前端輸入什麼密碼皆會通過
  console.log(verified);
  if (!verified) {
    // 密碼是錯的
    output.code = 406;
    output.error = "密碼錯誤";
    return res.json(output);
  }
  output.success = true;

  // 包 jwt 傳給前端
  const token = jwt.sign(
    {
      member_id: rows[0].member_id,
      email: rows[0].email,
    },
    process.env.JWT_SECRET // 設在 .env 的自己亂取的 jwt 金鑰 (JWT_SECRET)
  );

  // 登入成功的話，目前的 output Object 為：
  // output = { success: true, code: 0, error: "", }
  // 把資料使用 JSON 回應給 user // 在 user 端 (login.html 會將此放入 localstorage)
  output.data = {
    member_id: rows[0].member_id,
    email: rows[0].email,
    member_name: rows[0].member_name,
    images: rows[0].member_id,
    member_birth: rows[0].member_birth,
    id_number: rows[0].id_number,
    gender: rows[0].gender,
    location: rows[0].location,
    height: rows[0].height,
    weight: rows[0].weight,
    zodiac: rows[0].zodiac,
    bloodtype: rows[0].bloodtype,
    smoke: rows[0].smoke,
    alchohol: rows[0].alchohol,
    education_level: rows[0].education_level,
    job: rows[0].job,
    profile: rows[0].profile,
    mobile: rows[0].mobile,
    create_at: rows[0].create_at,
    token,
  };
  // 加入 output.data 為：
  // output = { success: true, code: 0, error: "", data: {id:會員id, email:會員email, nickname:會員綽號, token:jwt.sign形成的驗證亂碼 } }
  // 把所有登入資料全部回應給發出 req 的檔案
  res.json(output);
});
module.exports = router;
