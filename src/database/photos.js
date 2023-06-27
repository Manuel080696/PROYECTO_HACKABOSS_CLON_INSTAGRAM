'use strict';
const { getDB } = require('./db');

//Función para obtener todas las fotos con sus datos
const getAllPhotos = async (userId, search) => {
  let connection;

  try {
    connection = await getDB();
    if (search && userId) {
      const [result] = await connection.query(
        `
      SELECT 
      p.id AS photoID, 
      p.photoName,
      p.description,
      p.place, 
      p.date,
      u.id AS userID,
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

  WHERE
      description LIKE ? && name NOT LIKE '%borrado%'


  GROUP BY 
  p.id
ORDER BY 
  p.date DESC;
    `,
        [userId, `%${search}%`]
      );

      return result;
    } else if (search) {
      const [result] = await connection.query(
        `
      SELECT 
      p.id AS photoID, 
      p.photoName,
      p.description,
      p.place, 
      p.date,
      u.id AS userID,
      u.avatar,
      u.userName AS userPosted,
      COUNT(DISTINCT l.id) AS numLikes,
      COUNT(DISTINCT c.id) AS numComments,
      MAX(CASE WHEN l.id_user = 0 THEN 1 ELSE 0 END) AS dioLike
  FROM 
      photos p
      JOIN users u ON p.id_user = u.id
      LEFT JOIN likes l ON p.id = l.id_photo
      LEFT JOIN comments c ON p.id = c.id_photo

  WHERE 
      description LIKE ? &&  name NOT LIKE '%borrado%'

  GROUP BY 
  p.id
ORDER BY 
  p.date DESC;
    `,
        [`%${search}%`]
      );

      return result;
    } else {
      const [result] = await connection.query(
        `
        SELECT 
        p.id AS photoID, 
        p.photoName,
        p.description,
        p.place, 
        p.date,
        u.id AS userID,
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

        WHERE name NOT LIKE '%borrado%'

  
    GROUP BY 
    p.id
  ORDER BY 
    p.date DESC;
      `,
        [userId]
      );

      return result;
    }
  } finally {
    if (connection) connection.release();
  }
};

//Función para guardar un post
const createPost = async (userId, place, description, image = '') => {
  let connection;
  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
        INSERT INTO photos (
          id_user,
          photoName,
          place,
          description
          )
        VALUES(?,?,?,?)`,
      [userId, image, place, description]
    );

    return result.insertId;
  } finally {
    if (connection) connection.release();
  }
};

//Función para obtener un post por su id
const getPhoto = async (idPhoto, idUser) => {
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
      u.id AS userID,
      COUNT(DISTINCT l.id) AS numeroLikes,
      COUNT(DISTINCT c.id) AS numComments,
      MAX(CASE WHEN l.id_user = ? THEN 1 ELSE 0 END) AS dioLike
      
  FROM 
      photos p
      JOIN users u ON p.id_user = u.id
      LEFT JOIN likes l ON p.id = l.id_photo
      LEFT JOIN comments c ON p.id = c.id_photo
     
WHERE p.id = ? && name NOT LIKE '%borrado%'

  GROUP BY 
  p.id
ORDER BY 
  p.date DESC;
    `,
      [idUser, idPhoto]
    );

    const [comments] = await connection.query(
      `
      SELECT c.id, c.date, c.text, c.id_user, u.userName, u.avatar
      FROM comments c, users u
      WHERE id_photo =? && c.id_user = u.id
      `,
      [idPhoto]
    );

    if (data.length === 0) {
      return data;
    }
    const result = {
      photoID: data[0].id,
      photoName: data[0].photoName,
      description: data[0].description,
      place: data[0].place,
      date: data[0].date,
      userID: data[0].userID,
      userPosted: data[0].userName,
      avatar: data[0].avatar,
      numLikes: data[0].numeroLikes,
      dioLike: data[0].dioLike,
      numComments: data[0].numComments,
      comments: comments,
    };
    return result;
  } finally {
    if (connection) connection.release();
  }
};

//Borrar elementos de la base de datos (post)
const searchDeletePhoto = async (id) => {
  let connection;
  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT id, id_user,photoName
      FROM photos
      WHERE id = ?;
      `,
      [id]
    );
    return result;
  } finally {
    if (connection) connection.release();
  }
};

const deletePhoto = async (id) => {
  let connection;
  try {
    connection = await getDB();
    await connection.query(
      `
      DELETE FROM likes 
      WHERE id_photo=?;
      `,
      [id]
    );

    await connection.query(
      `
      DELETE FROM comments 
      WHERE id_photo=?;
      `,
      [id]
    );

    await connection.query(
      `
      DELETE FROM photos 
      WHERE photos.id=?;
      `,
      [id]
    );
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAllPhotos,
  createPost,
  getPhoto,
  searchDeletePhoto,
  deletePhoto,
};
