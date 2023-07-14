/*
{
  DB_HOST: 'localhost',
  DB_USER: 'root',
  DB_PASS: 'root',
  DB_NAME: 'mfee36'
}
 */

require("dotenv").config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

console.log({ DB_HOST, DB_USER, DB_PASS, DB_NAME });
