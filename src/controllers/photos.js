'use strict';
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');
const { generateError, createUpload } = require('../../helpers');
const { createPost } = require('../database/photos');

const { getAllPhotos } = require('../database/photos');

const getPhotosController = async (req, res, next) => {
  try {
    const photos = await getAllPhotos();
    console.log(photos);
    res.send({
      status: 'ok',
      data: photos[0],
    });
  } catch (error) {
    next(error);
  }
};

const newPhotosController = async (req, res, next) => {
  try {
    const { place, description } = req.body;
    if (!req.files && req.files.image) {
      throw generateError('Debe colocar una imagen en tu publicación', 400);
    }
    let imageFileName;
    const uploadsDir = path.join(__dirname, '../uploads');
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
      status: 'ok',
      message: `Post con id: ${photoId} creado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPhotosController,
  newPhotosController,
};
