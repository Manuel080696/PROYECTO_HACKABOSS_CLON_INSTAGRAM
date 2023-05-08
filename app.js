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
  regCodeController,
} = require('./src/controllers/users');

/*     Users*/
app.post('/user', newUserController);
app.get('/user/:id', getUserController);
app.post('/login', loginController);
app.get('/users/validate/:regCode', regCodeController);

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
