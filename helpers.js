'use strict';
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');

//Función para gestionar los errores
const generateError = (message, status) => {
  const error = new Error(message);
  error.httpStatus = status;
  return error;
};

//Función para crear el directorio de las fotos
const createUpload = async (path) => {
  try {
    await fs.access(path);
  } catch {
    await fs.mkdir(path);
  }
};
//Funcion para obtener el id a traves del token
const idToken = async (authorization) => {
  let token;
  try {
    token = jwt.verify(authorization, process.env.SECRET);
    return token;
  } catch {
    throw generateError('Token incorrecto', 401);
  }
};
module.exports = {
  generateError,
  createUpload,
  idToken,
};
