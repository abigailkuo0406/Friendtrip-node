const express = require('express')
const db = require(__dirname + "/../modules/mysql2")
const router = express.Router()

router.get("/", async (req, res) => {
    let output = {
        totalRows: 0,
        perPage: 25,
        totalPages: 0,
        page: 1,
        rows: []
    };

    const perPage = 10;

    let page = req.query.page ? parseInt(req.query.page) : 1;

    if (!page || page < 1) {
        return res.redirect(req.baseUrl)
    };

    const t_sql = `SELECT COUNT(1) totalRows FROM reserve WHERE member_id=3`;
    const [[{ totalRows }]] = await db.query(t_sql);

    let totalPages = 0;
    let rows = []

    if (totalRows) {
        totalPages = Math.ceil(totalRows / perPage);

        if (page > totalPages) {
            return res.redirect(req.baseUrl + "?page=" + totalPages);

        }
        const sql = ` SELECT  member_id, reserveId,rest_id,RestName,RestImg,reserve_date,reserve_time,reserve_people,invite_id ,iv_member_id 
        FROM reserve
        JOIN restaurant ON reserve.rest_id = restaurant.RestID 
        LEFT JOIN invite_member ON reserve.reserveId=invite_member.reserve_id
        WHERE member_id=3
        LIMIT ${perPage * (page - 1)
            }, ${perPage}`;
        [rows] = await db.query(sql);

    };

    output = { ...output, totalRows, perPage, totalPages, page, rows };

    return res.json(output);

})

module.exports = router

