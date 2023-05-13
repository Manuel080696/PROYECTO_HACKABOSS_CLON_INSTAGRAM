'use strict';
const { getDB } = require('./db');

const getAllPhotos = async (userId) => {
  let connection;
  console.log(userId);

  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT 
      p.id AS photoID, 
      p.photoName,
      p.description,
      p.place, 
      p.date,
      u.avatar,
      u.userName AS userPosted,
      COUNT(DISTINCT l.id) AS numLikes,
      COUNT(DISTINCT c.id) AS numComments,
      MAX(CASE WHEN l.id_user = ? THEN 1 ELSE 0 END) AS dioLike
  FROM 
      photos p
      JOIN users u ON p.id_user = u.id
      LEFT JOIN likes l ON p.id = l.id_photo
      LEFT JOIN comments c ON p.id = c.id_photo

  GROUP BY 
  p.id
ORDER BY 
  p.date DESC;
    `,
      [userId]
    );

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

const searchPhoto = async (description) => {
  let connection;
  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
        SELECT id, photoName, description FROM photos  WHERE description LIKE ? ORDER BY date DESC`,
      [`%${description}%`]
    );
    return result;
  } finally {
    if (connection) connection.release();
  }
};

const getPhotoController = async (idPhoto, idUser) => {
  let connection;
  try {
    connection = await getDB();
    const [data] = await connection.query(
      `
      SELECT 
      p.id, 
      p.photoName,
      p.description,
      p.place, 
      p.date,
      u.avatar,
      u.userName,
      COUNT(DISTINCT l.id) AS numeroLikes,
      COUNT(DISTINCT c.id) AS numComments,
      MAX(CASE WHEN l.id_user = ? THEN 1 ELSE 0 END) AS dioLike
  FROM 
      photos p
      JOIN users u ON p.id_user = u.id
      LEFT JOIN likes l ON p.id = l.id_photo
      LEFT JOIN comments c ON p.id = c.id_photo
WHERE p.id = ? 
  GROUP BY 
  p.id
ORDER BY 
  p.date DESC;
    `,
      [idUser, idPhoto]
    );

    const [comments] = await connection.query(
      `
      SELECT id, date, text, id_user
      FROM comments
      WHERE id_photo =?
      `,
      [idPhoto]
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
      isLike: data[0].dioLike,
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
