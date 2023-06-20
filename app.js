'use strict';

require('dotenv').config();
const path = require('path');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const { PORT } = process.env;

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static('./uploads'));
/**Rutas Users*/
const {
  newUserController,
  getUserController,
  loginController,
  deleteUserController,
  updateUserController,
} = require('./src/controllers/users');

/*Rutas Photos*/
const {
  getPhotosController,
  newPhotosController,
  searchPhotoController,
  getPhotoSingleController,
  deletePhotoController,
} = require('./src/controllers/photos');

/*Rutas Likes */
const { likeController } = require('./src/controllers/likes');

/*Rutas Comments */
const {
  postCommentController,
  unCommentController,
} = require('./src/controllers/comments');

const { isUserAuth } = require('./src/middleware/isUserAuth');
const { isUserExists } = require('./src/middleware/isUserExists');

/*     Users*/
app.post('/user', newUserController);
app.get('/user/:id', isUserExists, getUserController);
app.post('/login', loginController);
app.delete('/user/:id', isUserAuth, deleteUserController);
app.patch('/user', isUserAuth, updateUserController);

/*      Photos*/
app.get('/photos', getPhotosController);
app.post('/photos', isUserAuth, newPhotosController);
app.get('/photos/:id', getPhotoSingleController);
app.delete('/photos/:id', isUserAuth, deletePhotoController);

/*      Likes*/
app.post('/photos/:id/like', isUserAuth, likeController);

/*      Comentarios*/
app.post('/photos/:id/comment', isUserAuth, postCommentController);
app.delete(
  '/photos/:id/uncomment/:id_comment',
  isUserAuth,
  unCommentController
);

//Middleware 404 not found
app.use((req, res) => {
  res.status(404).send({
    status: 'error',
    message: 'Not found',
  });
});

//Middleware de gestión de errores
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.httpStatus || 500).send({
    status: 'error',
    message: error.message,
  });
});

app.use(express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`El servidor está escuchando en el puerto ${PORT}`);
});
