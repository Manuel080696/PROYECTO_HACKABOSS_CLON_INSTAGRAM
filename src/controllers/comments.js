'use strict';

const {
  existingPost,
  commentPhoto,
  existingComment,
  deleteComment,
} = require('../database/comments');
const { generateError } = require('../../helpers');

//Controller para hacer un comentario
const postCommentController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.userId;

    const existPost = await existingPost(id);

    if (req.body.comment === '') {
      throw generateError('No puedes hacer un comentario vacio ', 403);
    }

    if (existPost.length === 0) {
      throw generateError('El post que quiere comentar no existe', 403);
    }

    await commentPhoto(userId, id, comment);
    res.send({
      status: 200,
      message: `Comentario añadido correctamente en post:${id}`,
    });
  } catch (error) {
    next(error);
  }
};

//Controller para borrar un comentario
const unCommentController = async (req, res, next) => {
  try {
    const { id, id_comment } = req.params;
    const validateComment = await existingComment(id, id_comment);

    if (validateComment.id_user !== req.userId) {
      throw generateError('No puedes borrar este comentario', 403);
    }
    await deleteComment(id_comment);

    res.send({
      status: 200,
      message: `Comentario id:${id_comment} borrado correctamente en el post:${id}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postCommentController,
  unCommentController,
};
