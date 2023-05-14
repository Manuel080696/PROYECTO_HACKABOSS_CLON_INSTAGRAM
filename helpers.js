'use strict';
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');

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

//Función para obtener el id a traves del token
const idToken = async (authorization) => {
  let token;
  try {
    token = jwt.verify(authorization, process.env.SECRET);
    return token;
  } catch {
    throw generateError('Token incorrecto', 401);
  }
};

//Función para guardar el avatar
const saveAvatar = async (avatar) => {
  let imageFileName;
  const pathDir = path.join(__dirname, './uploads');
  await createUpload(pathDir);
  const uploadsDir = path.join(__dirname, '/uploads/avatar');
  await createUpload(uploadsDir);
  const image = sharp(avatar.data);
  image.resize(320);
  imageFileName = `${nanoid(24)}.jpg`;
  await image.toFile(path.join(uploadsDir, imageFileName));
  return imageFileName;
};

module.exports = {
  generateError,
  createUpload,
  idToken,
  saveAvatar,
};
