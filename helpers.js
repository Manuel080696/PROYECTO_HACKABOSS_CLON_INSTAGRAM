'use strict';
const fs = require('fs/promises');

//Función para gestionar los errores
const generateError = (message, status) => {
  const error = new Error(message);
  error.httpStatus = status;
  return error;
};

module.exports = {
  generateError,
};
