'use strict';

const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

const app = express();
app.use(fileUpload());
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static('./uploads'));
/**Rutas Users*/
const {
  newUserController,
  getUserController,
  loginController,
} = require('./src/controllers/users');

/*Rutas Photos*/
const {
  getPhotosController,
  newPhotosController,
  searchPhotoController,
  getPhotoSingleController,
} = require('./src/controllers/photos');
/*Rutas Likes */
const {
  newLikeController,
  deleteLikeController,
} = require('./src/controllers/likes');

/*Rutas Comments */
const {
  postCommentController,
  unCommentController,
} = require('./src/controllers/comments');

const { isUserAuth } = require('./src/middleware/isUserAuth');

/*     Users*/
app.post('/user', newUserController);
app.get('/user/:id', getUserController);
app.post('/login', loginController);

/*      Photos*/
app.get('/photos', getPhotosController);
app.post('/photos', isUserAuth, newPhotosController);
app.get('/photos/search', searchPhotoController);
app.get('/photos/:id', getPhotoSingleController);

/*      Likes*/
app.post('/photos/:id/like', isUserAuth, newLikeController);
app.delete('/photos/:id/unlike', isUserAuth, deleteLikeController);

/*      Comentarios*/
app.post('/photos/:id/comment', isUserAuth, postCommentController);
app.delete('/photos/:id/uncomment', isUserAuth, unCommentController);

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

app.listen(3000, () => {
  console.log('El servidor está escuchando en el puerto 3000');
});
