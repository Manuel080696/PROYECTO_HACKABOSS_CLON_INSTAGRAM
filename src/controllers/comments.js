'use strict';

const {
  existingPost,
  commentPhoto,
  existingComment,
  deleteComment,
} = require('../database/comments');
const { generateError } = require('../../helpers');

const postCommentController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;

    //para mirar se el post exist
    const existPost = await existingPost(id);

    if (req.body.comment === '') {
      throw generateError('No puedes hacer un comentario vacio ', 403);
    }

    if (existPost.length === 0) {
      throw generateError('El post que quiere comentar no existe', 403);
    }

    //Comentamos en la photo
    await commentPhoto(userId, id, comment);
    res.send({
      status: 200,
      message: `Comentario añadido correctamente en post:${id}`,
    });
  } catch (error) {
    next(error);
  }
};

const unCommentController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    //para mirar se el post exist
    const existComment = await existingComment(userId, id);
    console.log(existComment);

    if (existComment.length === 0) {
      throw generateError('El comentario que quieres borrar no existe', 403);
    }

    //Comentamos en la photo
    await deleteComment(existComment[0].id);

    res.send({
      status: 200,
      message: `Comentario borrado correctamente en el post:${id}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postCommentController,
  unCommentController,
};
