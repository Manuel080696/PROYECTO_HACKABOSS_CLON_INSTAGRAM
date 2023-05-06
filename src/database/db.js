"use strict";

const mysql = require("mysql2/promise");
require("dotenv").config();

const { HOST, USER_DB, PASSWORD_DB } = process.env;

let pool;

async function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      connectionLimit: 10,
      host: HOST,
      user: USER_DB,
      password: PASSWORD_DB,
    });
  }
  return await pool.getConnection();
}

module.exports = getDB;
