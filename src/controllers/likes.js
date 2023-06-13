'use strict';
// const bcrypt = require('bcrypt');
const {
  autoLike,
  existingLike,
  newLike,
  totalLike,
  deleteLikeById,
} = require('../database/likes');
const { generateError } = require('../../helpers');

//Controller para dar y quitar likes
const likeController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    let vote = false;
    const user = await autoLike(id);

    if (user[0].id_user === parseInt(userId)) {
      throw generateError('¡No puedes darte like a ti mismo!', 403);
    }
    const existsUserLike = await existingLike(userId, id);
    if (existsUserLike.length > 0) {
      await deleteLikeById(id, userId);
      vote = false;
    } else {
      await newLike(userId, id);
      vote = true;
    }
    const totalLikes = await totalLike(userId, id);
    res.send({
      status: 200,
      data: [
        {
          likes: totalLikes,
          vote: vote,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  likeController,
};
