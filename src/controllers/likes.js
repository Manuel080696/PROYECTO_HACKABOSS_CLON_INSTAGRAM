'use strict';
const bcrypt = require('bcrypt');
const {
  autoLike,
  existingLike,
  newLike,
  totalLike,
} = require('../database/likes');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const { generateError } = require('../../helpers');

const newLikeController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    //Para que no se vote así mismo
    const user = await autoLike(id);
    console.log(user[0].id_user);
    console.log(userId);
    if (user[0].id_user === parseInt(userId)) {
      throw generateError('¡No puedes darte like a ti mismo!', 403);
    }

    //El usuario no ha votado 2 veces
    const existsUserLike = await existingLike(userId, id);
    if (existsUserLike.length > 0) {
      throw generateError('Ya has dado like a este post', 403);
    }

    //Registramos el voto en la tabla
    await newLike(userId, id);

    //Suma de votos
    const totalLikes = await totalLike(userId, id);
    res.send({
      status: 200,
      data: totalLikes,
    });
  } catch (error) {
    next(error);
  }
};
// const deleteLikeController = async (req, res, next) => {
//   try {
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  newLikeController,
  //   deleteLikeController,
};
