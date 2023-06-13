'use strict';
const { getDB } = require('./db');

//Función para saber si existe un post
const existingPost = async (id) => {
  let connection;

  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
    SELECT id_user
    FROM photos
    WHERE id =?
    `,
      [id]
    );

    return result;
  } finally {
    if (connection) connection.release();
  }
};

//Función para guardar un comentario
const commentPhoto = async (userId, id, comment) => {
  let connection;

  try {
    connection = await getDB();
    await connection.query(
      `
    INSERT INTO comments(id_user,id_photo,text)
    VALUES(?,?,?)
    `,
      [userId, id, comment]
    );
    const data = await connection.query(
      `SELECT *
      FROM comments`
    );
    return data[0];
  } finally {
    if (connection) connection.release();
  }
};

//Función para comprobar si existe un comentario
const existingComment = async (id, id_comment) => {
  let connection;

  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT id_user
      FROM comments
      WHERE id_photo=? AND id=?
      `,
      [id, id_comment]
    );
    return result;
  } finally {
    if (connection) connection.release();
  }
};

//Función para borrar un comentario
const deleteComment = async (id) => {
  let connection;

  try {
    connection = await getDB();
    await connection.query(
      `
        DELETE 
        FROM comments
        WHERE id=?
        `,
      [id]
    );
    const data = await connection.query(
      `SELECT *
      FROM comments`
    );
    return data[0];
  } finally {
    if (connection) connection.release();
  }
};

//Función para saber el total de comentarios
const totalCommnets = async (id) => {
  let connection;

  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT COUNT(c.id_photo) AS comments
      FROM photos p
      LEFT JOIN comments c ON c.id_photo = p.id 
      WHERE p.id =?
          `,
      [id]
    );

    return result[0].comments;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  existingPost,
  commentPhoto,
  deleteComment,
  existingComment,
  totalCommnets,
};
