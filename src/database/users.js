'use strict';
const bcrypt = require('bcrypt');
const { getDB } = require('./db');
const { generateError } = require('../../helpers');

//Crear un usuario
const createUser = async (
  name,
  lastName,
  userName,
  email,
  password,
  birthDay
) => {
  let connection;
  try {
    connection = await getDB();

    const [user] = await connection.query(
      `
        SELECT id FROM users WHERE email=?
        `,
      [email]
    );

    if (user.length > 0) {
      throw generateError(
        'Ya existe un usuario en la base de datos con ese email',
        409
      );
    }
    //Encriptar la password
    const passHash = await bcrypt.hash(password, 8);

    //Crear el usuario
    await connection.query(
      `
        INSERT INTO users (name, lastName, userName, email, password, birthDay) VALUES (?, ?, ?, ?, ?, ?)
        `,
      [name, lastName, userName, email, passHash, birthDay]
    );

    return userName;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//Escoger usuario por ID
const getUserById = async (id) => {
  let connection;
  try {
    connection = await getDB();

    const result = await connection.query(
      `
      SELECT u.avatar, u.userName, u.birthDay  FROM users u WHERE id=?;
        `,
      [id]
    );
    const final = await connection.query(
      `
        SELECT p.photoName FROM photos p WHERE p.id_user=?
        `,
      [id]
    );

    if (result.lenght === 0) {
      throw generateError('No hay ningún usuario con esa id', 404);
    }

    const userObject = {
      userData: result[0],
      photoData: final[0],
    };
    return userObject;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//Escoger usuario por email
const getUserByEmail = async (email) => {
  let connection;
  try {
    connection = await getDB();

    const result = await connection.query(
      `
        SELECT * FROM users WHERE email=?;
          `,
      [email]
    );

    if (result.lenght === 0) {
      throw generateError('No hay ningún usuario con ese email', 404);
    }
    return result[0];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
};
