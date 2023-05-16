'use strict';
const path = require('path');
const sharp = require('sharp');

const { nanoid } = require('nanoid');
const { generateError, createUpload, idToken } = require('../../helpers');
const {
  createPost,
  searchPhoto,
  getPhoto,
  searchDeletePhoto,
  deletePhoto,
} = require('../database/photos');

const { getAllPhotos } = require('../database/photos');

//Controller para monstrar todos los posts
const getPhotosController = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      const token = await idToken(authorization);
      const photos = await getAllPhotos(token.id);

      res.send({
        status: 200,
        data: photos,
      });
    } else {
      const photos = await getAllPhotos();
      res.send({
        status: 200,
        data: photos,
      });
    }
  } catch (error) {
    next(error);
  }

  //Controller para crear un nuevo post
};
const newPhotosController = async (req, res, next) => {
  try {
    const { place, description } = req.body;
    if (!req.files && req.files.image) {
      throw generateError('Debes colocar una imagen en tu publicación', 400);
    }
    let imageFileName;
    const uploadsDir = path.join(__dirname, '../../uploads');
    await createUpload(uploadsDir);
    const photosDir = path.join(__dirname, '../../uploads/posts');
    await createUpload(photosDir);
    const image = sharp(req.files.image.data);
    image.resize(1080);
    imageFileName = `${nanoid(24)}.jpg`;
    await image.toFile(path.join(photosDir, imageFileName));
    const photoId = await createPost(
      req.userId,
      place,
      description,
      imageFileName
    );
    res.send({
      status: 200,
      message: `Post con id: ${photoId} creado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

//Controller para buscar posts por medio de una palabra que se encuentre en la descripción
const searchPhotoController = async (req, res, next) => {
  try {
    const { search } = req.body;
    const data = await searchPhoto(search);

    if (data.length === 0) {
      throw generateError('No hay photos con esta busquedá', 404);
    }
    res.send({
      status: 200,
      message: 'Fotos coincidentes',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

//Controller para obtener un post por medio de su id
const getPhotoSingleController = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      const token = await idToken(authorization);
      const photos = await getPhoto(req.params.id, token.id);
      res.send({
        status: 200,
        post: photos,
      });
    } else {
      const photos = await getPhoto(req.params.id);
      res.send({
        status: 200,
        post: photos,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Borrar un post o foto subida
const deletePhotoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const search = await searchDeletePhoto(id);

    if (search.length === 0) {
      throw generateError('No existe el post indicado', 403);
    }

    // console.log(req.userId);
    if (search[0].id_user !== req.userId) {
      throw generateError(
        'Este post pertenece a otro usuario, no puedes eliminarlo',
        403
      );
    }
    await deletePhoto(id);
    res.send({
      status: 200,
      message: 'Post eliminado con éxito',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPhotosController,
  newPhotosController,
  searchPhotoController,
  getPhotoSingleController,
  deletePhotoController,
};
