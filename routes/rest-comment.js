const express = require("express")
const db = require(__dirname + "/../modules/mysql2")
const router = express.Router()
const upload = require(__dirname + "/../modules/img-upload")
const multipartParser = upload.none()

// 新增評論資料
router.post("/addcomment", multipartParser, async (req, res) => {
    const sql =
        `INSERT INTO restcommment (
            RestID, member_id, rating, ComtText,created_time) VALUES ( ?, ?, ?, ?, NOW())`

    const [result] = await db.query(sql, [
        req.body.RestID,
        req.body.member_id,
        req.body.rating,
        req.body.ComtText,
    ])

    res.json({
        result
    })
});
module.exports = router;
