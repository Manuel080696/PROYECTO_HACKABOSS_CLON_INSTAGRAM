'use strict';
const { getDB } = require('./db');
const { generateError } = require('../../helpers');

const getAllPhotos = async () => {
  let connection;

  try {
    connection = await getDB();
    const [result] = connection.query(`
SELECT * FROM photos ORDER BY date DESC`);
    console.log(result);
    return result;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAllPhotos,
};
