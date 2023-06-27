'use strict';
const path = require('path');
const sharp = require('sharp');

const { nanoid } = require('nanoid');
const {
  generateError,
  createUpload,
  idToken,
  deletephotoUploads,
} = require('../../helpers');
const {
  createPost,
  getPhoto,
  searchDeletePhoto,
  deletePhoto,
} = require('../database/photos');

const { getAllPhotos } = require('../database/photos');
const { getUserById } = require('../database/users');

//Controller para monstrar todos los posts
const getPhotosController = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { authorization } = req.headers;

    if (authorization) {
      const token = await idToken(authorization);
      if (search) {
        const photos = await getAllPhotos(token.id, search);
        if (photos.length === 0) {
          throw generateError('No hay photos con esta busquedá', 404);
        }

        res.send({
          status: 200,
          data: photos,
        });
      } else {
        const photos = await getAllPhotos(token.id);
        res.send({
          status: 200,
          data: photos,
        });
      }
    } else if (search) {
      const photos = await getAllPhotos(undefined, search);
      if (photos.length === 0) {
        throw generateError('No hay photos con esta busquedá', 404);
      }

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

    if (req.files && req.files.image) {
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
      console.log(photoId);

      res.send({
        status: 201,
        message: `Post con id: ${photoId} creado correctamente`,
        data: [
          {
            userID: req.userId,
            place,
            description,
            photoName: imageFileName,
            photoID: photoId,
          },
        ],
      });
    } else {
      throw generateError('Debes colocar una imagen en tu publicación', 400);
    }
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
      if (photos.length === 0) {
        throw generateError('No existe el post', 404);
      }
      res.send({
        status: 200,
        data: photos,
      });
    } else {
      const photos = await getPhoto(req.params.id);
      if (photos.length === 0) {
        throw generateError('No existe el post', 404);
      }
      res.send({
        status: 200,
        data: photos,
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

    if (search[0].id_user !== req.userId) {
      throw generateError(
        'Este post pertenece a otro usuario, no puedes eliminarlo',
        403
      );
    }
    await deletePhoto(id);
    await deletephotoUploads(search[0].photoName);
    res.send({
      status: 200,
      message: `El post ${id} eliminado con éxito `,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPhotosController,
  newPhotosController,
  getPhotoSingleController,
  deletePhotoController,
};
