'use strict';
const path = require('path');
const fuse = require('fuse.js');
const sharp = require('sharp');
const { nanoid } = require('nanoid');
const { generateError, createUpload } = require('../../helpers');
const {
  createPost,
  searchPhoto,
  getPhotoController,
} = require('../database/photos');

const { getAllPhotos } = require('../database/photos');

const getPhotosController = async (req, res, next) => {
  try {
    const photos = await getAllPhotos();
    console.log(photos);
    res.send({
      status: 200,
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
    const options = {
      keys: ['description'],
      threshold: 0.6,
    };
    const data = await searchPhoto();
    const fuseObject = new fuse(data, options);
    const results = fuseObject.search(searchObj);

    const resultadosSinRefIndex = results.map((resultado) => {
      const objeto = resultado.item;
      delete objeto.refIndex;
      return objeto;
    });
    res.send({
      status: 200,
      message: 'Fotos coincidentes',
      data: resultadosSinRefIndex,
    });
  } catch (error) {
    next(error);
  }
};

const getPhotoSingleController = async (req, res, next) => {
  try {
    const photos = await getPhotoController();
    console.log(photos);
    res.send({
      status: 200,
      data: photos[0],
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
};
