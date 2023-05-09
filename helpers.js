'use strict';
const fs = require('fs/promises');

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

module.exports = {
  generateError,
  createUpload,
};
