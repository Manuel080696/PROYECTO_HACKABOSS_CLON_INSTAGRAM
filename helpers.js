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
  console.log(photo);
  try {
    await fs.unlink(`./uploads/posts/${photo}`);
    return;
  } catch (error) {
    throw generateError('There was an error deleting the file', 401);
  }
};

//Función para gestionar el envio de emails con SendMail

const sgEmail = require('@sendgrid/mail');

sgEmail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (to, subject, body) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM,
      subject,
      text: body,
      html: `
          <div>
              <h1>${subject}</h1>
              <p>${body}</p>
          </div>
          `,
    };
    console.log(msg);
    await sgEmail.send(msg);
  } catch (error) {
    throw generateError('Email sending error', 401);
  }
};

//Función para guardar una foto
const savePhoto = async (photo) => {
  console.log(photo);
  let imageFileName;
  const uploadsDir = path.join(__dirname, './uploads');
  await createUpload(uploadsDir);
  const photosDir = path.join(__dirname, './uploads/posts');
  await createUpload(photosDir);
  const image = sharp(photo)
    .toFormat('webp')
    .resize({ with: 640, height: 800, fit: 'contain' });

  imageFileName = `${nanoid(24)}.webp`;
  await image.toFile(path.join(photosDir, imageFileName));
  return imageFileName;
};

module.exports = {
  generateError,
  createUpload,
  idToken,
  saveAvatar,
  deleteAvatar,
  deletephotoUploads,
  sendMail,
  savePhoto,
};
