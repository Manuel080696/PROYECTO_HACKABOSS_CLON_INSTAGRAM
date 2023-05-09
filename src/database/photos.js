'use strict';
const { getDB } = require('./db');
// const { generateError } = require('../../helpers');

const getAllPhotos = async () => {
  let connection;

  try {
    connection = await getDB();
    const result = connection.query(`
SELECT * FROM photos ORDER BY date DESC`);
    console.log(result);
    return result;
  } finally {
    if (connection) connection.release();
  }
};

const createPost = async (userId, place, description, image = '') => {
  let connection;
  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
        INSERT INTO photos (id_user, photoName, place, description)
        VALUES(?,?,?,?)`,
      [userId, image, place, description]
    );
    return result.insertId;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAllPhotos,
  createPost,
};
