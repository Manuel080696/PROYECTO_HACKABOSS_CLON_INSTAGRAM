'use strict';

const {
  existingPost,
  commentPhoto,
  existingComment,
  deleteComment,
} = require('../database/comments');
const { generateError } = require('../../helpers');
const { searchDeletePhoto } = require('../database/photos');

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

    const data = await commentPhoto(userId, id, comment);
    res.send({
      status: 201,
      message: `Comentario añadido correctamente en post:${id}`,
      data: data,
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
    console.log(validateComment);
    if (validateComment.length === 0) {
      throw generateError('No existe el comentario indicado', 403);
    }
    const existsPost = await searchDeletePhoto(id);

    if (existsPost.length === 0) {
      throw generateError('No existe el post indicado', 403);
    }
    if (validateComment[0].id_user !== req.userId) {
      throw generateError('No puedes borrar este comentario', 403);
    }
    const data = await deleteComment(id_comment);

    res.send({
      status: 201,
      message: `Comentario id:${id_comment} borrado correctamente en el post:${id}`,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postCommentController,
  unCommentController,
};
