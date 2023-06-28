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
    throw generateError('You must login again', 401);
  }
};

//Función para guardar el avatar
const saveAvatar = async (avatar) => {
  let imageFileName;
  const uploadsDir = path.join(__dirname, './uploads');
  await createUpload(uploadsDir);
  const avatarDir = path.join(__dirname, './uploads/avatar');
  await createUpload(avatarDir);
  const image = sharp(avatar.data).toFormat('webp').resize(320);
  imageFileName = `${nanoid(24)}.webp`;
  await image.toFile(path.join(avatarDir, imageFileName));
  return imageFileName;
};

//Función para borrar el avatar antiguo
const deleteAvatar = async (avatar) => {
  try {
    await fs.unlink(`./uploads/avatar/${avatar}`);
    return;
  } catch (error) {
    throw generateError('There was an error deleting the file', 401);
  }
};

//Función para borrar una foto
const deletephotoUploads = async (photo) => {
  try {
    await fs.unlink(`./uploads/posts/${photo}`);
    return;
  } catch (error) {
    throw generateError('There was an error deleting the file', 401);
  }
};

module.exports = {
  generateError,
  createUpload,
  idToken,
  saveAvatar,
  deleteAvatar,
  deletephotoUploads,
};
