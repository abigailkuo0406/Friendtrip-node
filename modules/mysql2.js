//建立  mysql
const mysql = require("mysql2");
//確認環境
const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
console.log({ DB_HOST, DB_USER, DB_PASS, DB_NAME });

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
});

module.exports = pool.promise();
