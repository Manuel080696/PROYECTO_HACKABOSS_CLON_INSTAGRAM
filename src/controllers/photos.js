'use strict';
const path = require('path');
const sharp = require('sharp');

const { nanoid } = require('nanoid');
const {
  generateError,
  createUpload,
  idToken,
  deletephotoUploads,
  savePhoto,
} = require('../../helpers');
const {
  createPost,
  getPhoto,
  searchDeletePhoto,
  deletePhoto,
  deletePhotoUpdate,
  updatePost,
} = require('../database/photos');

const { getAllPhotos } = require('../database/photos');

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
          throw generateError('No photos with this search', 404);
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
        throw generateError('No photos with this search', 404);
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
      const image = sharp(req.files.image.data)
        .toFormat('webp')
        .resize({ with: 640, height: 800, fit: 'contain' });

      imageFileName = `${nanoid(24)}.webp`;
      await image.toFile(path.join(photosDir, imageFileName));
      const photoId = await createPost(
        req.userId,
        place,
        description,
        imageFileName
      );

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
      throw generateError('You must put an image in your post', 400);
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
        throw generateError('The post does not exist', 404);
      }
      res.send({
        status: 200,
        data: photos,
      });
    } else {
      const photos = await getPhoto(req.params.id);
      if (photos.length === 0) {
        throw generateError('The post does not exist', 404);
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
      throw generateError('The post does not exist', 403);
    }

    if (search[0].id_user !== req.userId) {
      throw generateError(
        'This post belongs to another user, you cannot delete it',
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

//Controller para actualizar un post

const updatePhotoSingleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const photo = await getPhoto(id);
    console.log(photo.photoName);

    if (req.userId !== photo.userID) {
      throw generateError(
        'You do not have permissions to update this post',
        401
      );
    }
    const { place, description } = req.body;

    if (!place || !description) {
      throw generateError('You must submit all fields', 400);
    }
    let updatePhoto;
    if (req.files && req.files.image) {
      if (photo.photoName === null) {
        updatePhoto = await savePhoto(req.files.image);
      } else {
        // await deletePhotoUpdate(id);
        await deletephotoUploads(photo.photoName);
        updatePhoto = await savePhoto(req.files.image.data);
      }
    } else {
      updatePhoto = photo.photoName;
    }
    console.log(updatePhoto);
    await updatePost(id, updatePhoto, place, description);
    res.send({
      status: 'ok',
      message: `El post con id:${id} ha sido actualizado correctamente`,
      data: [{ photoID: id, userPosted: photo.userID, place, description }],
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
  updatePhotoSingleController,
};
