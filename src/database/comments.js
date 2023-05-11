'use strict';
const { getDB } = require('./db');

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
    return;
  } finally {
    if (connection) connection.release();
  }
};

const existingComment = async (userId, id) => {
  let connection;

  try {
    connection = await getDB();
    const [result] = await connection.query(
      `
      SELECT id
      FROM comments
      WHERE id_user=? AND id_photo=?
      `,
      [userId, id]
    );
    console.log(result[0]);
    return result;
  } finally {
    if (connection) connection.release();
  }
};

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

    return;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  existingPost,
  commentPhoto,
  deleteComment,
  existingComment,
};
