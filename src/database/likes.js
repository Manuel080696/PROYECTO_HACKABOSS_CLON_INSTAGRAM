'use strict';
const { getDB } = require('./db');

//Función para saber si el usuario le ha dado un like a un post suyo
const autoLike = async (id) => {
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

//Función para saber si el usuario ya le ha dado like a un post
const existingLike = async (userId, id) => {
  let connection;

  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT id
      FROM likes
      WHERE id_user=? AND id_photo=?
      `,
      [userId, id]
    );
    return result;
  } finally {
    if (connection) connection.release();
  }
};

//Función para registrar un nuevo like
const newLike = async (userId, id) => {
  let connection;

  try {
    connection = await getDB();
    await connection.query(
      `
      INSERT INTO likes (id_user, id_photo)
      VALUES (?,?);
        `,
      [userId, id]
    );
  } finally {
    if (connection) connection.release();
  }
};

//Función para contar los likes de un post
const totalLike = async (userId, id) => {
  let connection;

  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT COUNT(l.id_photo) AS likes
      FROM photos p
      LEFT JOIN likes l ON l.id_photo = p.id 
      WHERE p.id =?
          `,
      [id]
    );

    return result[0].likes;
  } finally {
    if (connection) connection.release();
  }
};

//Funcion para eliminar un like
const deleteLikeById = async (id, userId) => {
  let connection;

  try {
    connection = await getDB();
    await connection.query(
      `
      DELETE FROM likes WHERE id_photo = ? AND id_user=?
          `,
      [id, userId]
    );
    return;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  autoLike,
  existingLike,
  newLike,
  totalLike,
  deleteLikeById,
};
