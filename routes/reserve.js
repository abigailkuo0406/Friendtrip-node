const express = require("express");
const db = require(__dirname + "/../modules/mysql2");
const dayjs = require("dayjs");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();

router.post("/", multipartParser, async (req, res) => {
  let output = {
    totalRows: 0,
    perPage: 25,
    totalPages: 0,
    page: 1,
    rows: [],
  };

  const perPage = 3;

  //取得queryString查詢條件
  let cancel = req.query.cancel || "";
  let noCancel = req.query.nocancel || "";
  let pass = req.query.pass || "";
  let noPass = req.query.nopass || "";




  let page = req.query.page ? parseInt(req.query.page) : 1;

  if (!page || page < 1) {
    return res.redirect(req.baseUrl);
  }

  let cancelOrNot = "";
  let passOrNot = "";

  //設定有關鍵字時，SQL查詢語法
  if (cancel || noCancel) {
    if (cancel) {
      cancelOrNot = `&& state=0`
    }
    else if (noCancel) {
      cancelOrNot = `&& state=1`
    }
  }

  if (pass || noPass) {
    if (pass) {
      passOrNot = `&& pass=1`
    }
    else if (noPass) {
      passOrNot = `&& pass=0`
    }
  }

  // 定義當天
  const theDay = Date.parse(new Date().toDateString())

  let checkDateRows = []

  if (req.body.memberID) {
    // 1. 先檢查有沒有過期的訂單

    // 挑出某會員的訂單
    const sqlCheckDate = `SELECT * FROM reserve WHERE reserve_member_id=${req.body.memberID}`
    checkDateRows = await db.query(sqlCheckDate);

    // 檢查日期
    checkDateRows[0].forEach((i) => {
      // 轉換日期格式
      i.reserve_date = dayjs(i.reserve_date).format("YYYY-MM-DD");

      // 如果日期比今天小，就是過期了(已完成)，更新pass欄位為1
      if (Date.parse(i.reserve_date) < theDay) {
        const sqlDateUpdate = `UPDATE reserve SET pass = 1 WHERE reserve.reserveId = ${i.reserveId}`;
        i = db.query(sqlDateUpdate) //要執行update SQL
      };
    });

    // 撈出要顯示的訂單
    const t_sql = `SELECT COUNT(1) totalRows FROM reserve WHERE reserve_member_id=${req.body.memberID} ${cancelOrNot} ${passOrNot}`;
    const [[{ totalRows }]] = await db.query(t_sql);

    let totalPages = 0;
    let rows = [];

    if (totalRows) {
      totalPages = Math.ceil(totalRows / perPage);

      if (page > totalPages) {
        return res.redirect(req.baseUrl + "?page=" + totalPages);
      }
      const sql = ` SELECT  reserve_member_id, reserveId,rest_id,RestName,RestPhone,RestAdress,RestImg,reserve_date,reserve_time,reserve_people,state,pass
        FROM reserve
        JOIN restaurant ON reserve.rest_id = restaurant.RestID 
        WHERE reserve_member_id=${req.body.memberID}${cancelOrNot}${passOrNot}
        ORDER BY reserveId DESC
        LIMIT ${perPage * (page - 1)}, ${perPage} `;
      [rows] = await db.query(sql);
      rows.forEach((i) => {
        i.reserve_date = dayjs(i.reserve_date).format("YYYY-MM-DD");
      });
    }
    output = {
      ...output,
      totalRows,
      perPage,
      totalPages,
      page,
      rows,
      jwtData: res.locals.jwtData,
    };

    res.json(output);
  }
});

// 取得單筆訂位資料
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
    const sql = `SELECT  reserve_member_id, reserveId,rest_id,RestName,RestPhone,RestAdress,RestImg,reserve_date,reserve_time,reserve_people,state
    FROM reserve
    JOIN restaurant ON reserve.rest_id = restaurant.RestID
    WHERE reserveId=${reserveRid}`;
    const [rows] = await db.query(sql);

    if (rows.length) {
      output.success = true;
      output.row = rows[0];
      output.row.reserve_date = dayjs(output.row.reserve_date).format(
        "YYYY-MM-DD"
      );
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

// 修改訂位
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

  const sql2 = `DELETE FROM invite_member WHERE reserve_id=${reserveRid}`;
  const [result2] = await db.query(sql2, [req.body.iv_member_id]);

  // 編輯邀請好友資料
  const sql3 =
    "INSERT INTO `invite_member`" +
    "(`reserve_id`, `iv_member_id`, `created_time`)" +
    " VALUES ( ?, ?, NOW())";

  if (req.body.invites) {
    const ivListLength = req.body.invites.length;
    for (let i = 0; i < ivListLength; i++) {
      const [result2] = await db.query(sql3, [
        reserveRid,
        req.body.invites[i].iv_member_id,
      ]);
    }
  }
  res.json({
    edit: result1,
    delete: result2,

    postData: req.body,
  });
});

// 刪除訂位(修改訂位狀態)
router.put("/state", multipartParser, async (req, res) => {
  const reserveRId = req.body.reserve_id;
  const sql = `UPDATE reserve SET state=0 WHERE reserveId=${reserveRId}`;
  const [result] = await db.query(sql);
  res.json({
    result: result,
  });
});

module.exports = router;
