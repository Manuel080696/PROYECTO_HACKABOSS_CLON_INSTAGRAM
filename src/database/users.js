'use strict';
const bcrypt = require('bcrypt');
const { getDB } = require('./db');
const { generateError } = require('../../helpers');

//Crear un usuario
const createUser = async (
  avatar,
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
      throw generateError('There is already a user with that email', 409);
    }

    const passHash = await bcrypt.hash(password, 8);
    if (avatar) {
      //Crear el usuario
      await connection.query(
        `
        INSERT INTO users (avatar, name, lastName, userName, email, password, birthDay, active ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `,
        [avatar, name, lastName, userName, email, passHash, birthDay]
      );
    } else {
      await connection.query(
        `
    INSERT INTO users ( name, lastName, userName, email, password, birthDay, active ) VALUES ( ?, ?, ?, ?, ?, ?, 1)
    `,
        [name, lastName, userName, email, passHash, birthDay]
      );
    }

    return userName;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//Crear un usuario sin avatar asignado
const createUserNoAvatar = async (
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
      throw generateError('There is already a user with that email', 409);
    }

    const passHash = await bcrypt.hash(password, 8);

    //Crear el usuario
    await connection.query(
      `
        INSERT INTO users ( name, lastName, userName, email, password, birthDay, active ) VALUES ( ?, ?, ?, ?, ?, ?, 1)
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

      SELECT u.avatar, u.userName, u.name, u.lastName, u.birthDay, u.dateCreation FROM users u WHERE id=?;

        `,
      [id]
    );
    const final = await connection.query(
      `
        SELECT id AS photoID, photoName, place, description FROM photos WHERE id_user=?
        `,
      [id]
    );

    if (result.lenght === 0) {
      throw generateError('The user does not exist', 404);
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

    if (result[0].length === 0) {
      throw generateError('There is no user with that email', 404);
    }
    return result[0];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
//Borrar usuario por el id
const deleteUserById = async (id) => {
  let connection;
  try {
    connection = await getDB();
    await connection.query(
      `
    UPDATE users
    SET avatar = NULL, name ='[borrado]', lastName = '[borrado]', userName = '[borrado]', password = '[borrado]', 
    birthday = '[borrado]', role = '[borrado]', active = 0, deleted = 1, lastAuthUpdate = ?
    WHERE id = ?`,
      [new Date(), id]
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Para saber si existe el usuario
const userExists = async (id) => {
  let connection;
  try {
    connection = await getDB();
    const user = await connection.query(
      `
        SELECT id
        FROM users
        WHERE id=?
      `,
      [id]
    );
    return user;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Actualizar los datos de un usuario
const updateUser = async (id, avatar, name, lastName, userName, birthDay) => {
  let connection;
  try {
    connection = await getDB();
    await connection.query(
      `
        UPDATE users
        SET avatar =?, name =?, lastName =?, userName =?, birthDay =?
        WHERE id =?
      `,
      [avatar, name, lastName, userName, birthDay, id]
    );
    return;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//Función para leer el avatar del usuario
const readAvatar = async (id) => {
  let connection;
  try {
    connection = await getDB();
    const [avatar] = await connection.query(
      `
        SELECT avatar
        FROM users
        WHERE id =?
      `,
      [id]
    );
    return avatar[0];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Actualizar los datos de un usuario tras recuperar el password
const updateRecoverUserPassword = async (recoverCode, email) => {
  let connection;
  try {
    connection = await getDB();
    await connection.query(
      `
        UPDATE users
        SET recoverCode=?, lastAuthUpdate=?
        WHERE email=?
      `,
      [recoverCode, new Date(), email]
    );
    return;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Comprobar que existe un usuario con un código de recuperación activo

const getUserByRecoverCode = async (recoverCode) => {
  let connection;
  try {
    connection = await getDB();

    const result = await connection.query(
      `
      SELECT id
      FROM users
      WHERE recoverCode=?;
          `,
      [recoverCode]
    );

    if (result[0].length === 0) {
      throw generateError('Incorrect recovery code', 400);
    }

    return result[0];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Actualizar la contraseña proporcionada por el usuario

const updateResetUserPassword = async (newPassword, id) => {
  let connection;
  const passHash = await bcrypt.hash(newPassword, 8);
  try {
    connection = await getDB();
    await connection.query(
      `
      UPDATE users
      SET password=?, lastAuthUpdate=?, recoverCode=NULL
      WHERE id=?
      `,
      [passHash, new Date(), id]
    );
    return;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createUserNoAvatar,
  createUser,
  getUserById,
  getUserByEmail,
  getUserByRecoverCode,
  deleteUserById,
  userExists,
  updateUser,
  updateRecoverUserPassword,
  updateResetUserPassword,
  readAvatar,
};
