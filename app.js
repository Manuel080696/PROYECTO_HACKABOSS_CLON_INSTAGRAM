'use strict';

const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(express.json());

/**Rutas*/
const {
  newUserController,
  getUserController,
  loginController,
} = require('./src/controllers/users');

const {
  getPhotosController,
  newPhotosController,
  searchPhotoController,
} = require('./src/controllers/photos');
const { isUserAuth } = require('./src/middleware/isUserAuth');

/*     Users*/
app.post('/user', newUserController);
app.get('/user/:id', getUserController);
app.post('/login', loginController);

/*      Photos*/
app.get('/photos', getPhotosController);
app.post('/photos', isUserAuth, newPhotosController);
app.get('/photos/search', searchPhotoController);

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

app.listen(3001, () => {
  console.log('El servidor está escuchando en el puerto 3001');
});
