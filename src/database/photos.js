'use strict';
const { getDB } = require('./db');

const getAllPhotos = async (userId) => {
  let connection;

  try {
    connection = await getDB();
    const result = connection.query(
      `
    SELECT p.id, p.photoName, p.description, p.place, p.date, u.id, u.userName, u.avatar, l.id AS likeID, COUNT(l.id_photo) AS numeroLikes, COUNT(c.id_photo) AS comments
    FROM photos p
    INNER JOIN users u ON u.id = p.id_user 
    LEFT JOIN likes l ON l.id_photo = p.id AND l.id_user =?
    LEFT JOIN comments c ON c.id_photo = p.id
    GROUP BY p.id, u.userName ORDER BY date DESC
    `,
      [userId]
    );

    /*  const [final] = await connection.query(
      `
  SELECT COUNT(c.id_photo) AS comments
  FROM photos p
  LEFT JOIN comments c ON c.id_photo = p.id 
  WHERE p.id =?
      `,
      [id]
    ); */

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

const getPhotoController = async (id) => {
  let connection;
  try {
    connection = await getDB();
    const [data] = await connection.query(
      `
      SELECT p.id, p.photoName, p.description, p.place, p.date, u.id, u.userName, u.avatar, COUNT(l.id_photo) AS numeroLikes
      FROM photos p
      INNER JOIN users u ON u.id = p.id_user 
      LEFT JOIN likes l ON l.id_photo = p.id 
      WHERE p.id = ? 
      GROUP BY p.id, u.userName;
      
      `,
      [id]
    );

    const [comments] = await connection.query(
      `
      SELECT id, date, text, id_user
      FROM comments
      WHERE id_photo =?
      `,
      [id]
    );

    const result = {
      id: data[0].id,
      photoName: data[0].photoName,
      description: data[0].description,
      place: data[0].place,
      date: data[0].date,
      userName: data[0].userName,
      avatar: data[0].avatar,
      numeroLikes: data[0].numeroLikes,
      comments: comments,
    };

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
