'use strict';

const { getAllPhotos } = require('../database/photos');

const getPhotosController = async (req, res, next) => {
  try {
    const photos = await getAllPhotos();
    res.send({
      status: 'ok',
      data: photos,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPhotosController,
};
