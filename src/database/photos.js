'use strict';
const { getDB } = require('./db');

const getAllPhotos = async () => {
  let connection;

  try {
    connection = await getDB();
    const result = connection.query(`
    SELECT p.id, p.photoName, p.description, p.place, p.date, u.id, u.userName, u.avatar, COUNT(l.id_photo) AS numeroLikes
    FROM photos p
    INNER JOIN users u ON u.id = p.id_user 
    LEFT JOIN likes l ON l.id_photo = p.id 
    GROUP BY p.id, u.userName ORDER BY date DESC

`);
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

const searchPhoto = async () => {
  let connection;
  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
        SELECT id, photoName, description FROM photos  ORDER BY date DESC`
    );
    return result;
  } finally {
    if (connection) connection.release();
  }
};

const getPhotoController = async () => {
  let connection;
  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT p.id, p.photoName, p.description, p.place, p.date, u.id, u.userName, u.avatar, COUNT(l.id_photo) AS numeroLikes
      FROM photos p
      INNER JOIN users u ON u.id = p.id_user 
      LEFT JOIN likes l ON l.id_photo = p.id 
      GROUP BY p.id, u.userName;
      
      `
    );
    return result;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAllPhotos,
  createPost,
  searchPhoto,
  getPhotoController,
};
