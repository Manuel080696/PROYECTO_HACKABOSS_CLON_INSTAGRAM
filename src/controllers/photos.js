'use strict';
const path = require('path');
const sharp = require('sharp');

const { nanoid } = require('nanoid');
const { generateError, createUpload, idToken } = require('../../helpers');
const {
  createPost,
  searchPhoto,
  getPhotoController,
} = require('../database/photos');

const { getAllPhotos } = require('../database/photos');

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
};
const newPhotosController = async (req, res, next) => {
  try {
    const { place, description } = req.body;
    if (!req.files && req.files.image) {
      throw generateError('Debes colocar una imagen en tu publicación', 400);
    }
    let imageFileName;
    const uploadsDir = path.join(__dirname, '../uploads/posts');
    await createUpload(uploadsDir);
    const image = sharp(req.files.image.data);
    image.resize(1080);
    imageFileName = `${nanoid(24)}.jpg`;
    await image.toFile(path.join(uploadsDir, imageFileName));
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

const searchPhotoController = async (req, res, next) => {
  try {
    const { searchObj } = req.body;
    const data = await searchPhoto(searchObj);

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

const getPhotoSingleController = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      const token = await idToken(authorization);
      const photos = await getPhotoController(req.params.id, token.id);
      res.send({
        status: 200,
        post: photos,
      });
    } else {
      const photos = await getPhotoController(req.params.id);
      res.send({
        status: 200,
        post: photos,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPhotosController,
  newPhotosController,
  searchPhotoController,
  getPhotoSingleController,
};
