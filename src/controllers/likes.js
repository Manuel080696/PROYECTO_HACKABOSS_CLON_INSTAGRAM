'use strict';
// const bcrypt = require('bcrypt');
const {
  autoLike,
  existingLike,
  newLike,
  totalLike,
  deleteLikeById,
} = require('../database/likes');
// const joi = require('joi');
// const jwt = require('jsonwebtoken');
const { generateError } = require('../../helpers');

const likeController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    let vote = false;
    //Para que no se vote así mismo
    const user = await autoLike(id);

    if (user[0].id_user === parseInt(userId)) {
      throw generateError('¡No puedes darte like a ti mismo!', 403);
    }

    //El usuario no ha votado 2 veces
    const existsUserLike = await existingLike(userId, id);
    if (existsUserLike.length > 0) {
      await deleteLikeById(id, userId);
      vote = false;
    } else {
      //Registramos el voto en la tabla
      await newLike(userId, id);
      vote = true;
    }

    //Suma de votos
    const totalLikes = await totalLike(userId, id);
    res.send({
      status: 200,
      likes: totalLikes,
      vote: vote,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  likeController,
};
