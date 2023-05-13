'use strict';
const bcrypt = require('bcrypt');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');
const { generateError, createUpload } = require('../../helpers');
const {
  createUser,
  getUserById,
  getUserByEmail,
  deleteUserById,
} = require('../database/users');
const joi = require('joi');
const jwt = require('jsonwebtoken');

const newUserController = async (req, res, next) => {
  try {
    const { name, lastName, userName, email, password, birthDay } = req.body;
    const schema = joi.object().keys({
      name: joi.string().min(3).max(20).required(),
      lastName: joi.string().min(3).max(40).required(),
      userName: joi.string().min(3).max(20).required(),
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
      birthDay: joi.date(),
      avatar: joi.object({
        filename: joi.string().required(),
        mimetype: joi
          .string()
          .valid('image/png', 'image/jpeg', 'image/gif')
          .required(),
        size: joi.number().max(5000000).required(),
        path: joi.string().required(),
      }),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      throw generateError(validation.error, 400);
    }

    let imageFileName;
    const uploadsDir = path.join(__dirname, '../uploads/avatar');
    await createUpload(uploadsDir);
    const image = sharp(req.files.avatar.data);
    image.resize(320);
    imageFileName = `${nanoid(24)}.jpg`;
    await image.toFile(path.join(uploadsDir, imageFileName));

    const newUser = await createUser(
      imageFileName,
      name,
      lastName,
      userName,
      email,
      password,
      birthDay
    );

    res.send({
      status: 202,
      message: `Usuario ${newUser} creado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

const getUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    res.send({
      status: 'ok',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw generateError('Debes enviar un email y una password', 400);
    }

    const [user] = await getUserByEmail(email);

    const validationPassHas = await bcrypt.compare(password, user.password);

    if (!validationPassHas) {
      throw generateError('La contraseña no coincide', 401);
    }

    const payLoad = { id: user.id };

    const token = jwt.sign(payLoad, process.env.SECRET, {
      expiresIn: '1d',
    });

    res.send({
      status: 'ok',
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.userId !== parseInt(id)) {
      throw generateError(
        'No tienes permisos para eliminar a este usuario',
        401
      );
    }
    await deleteUserById(id);
    res.send({
      status: 'ok',
      message: `El usuario con id:${id} ha sido eliminado`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  newUserController,
  getUserController,
  loginController,
  deleteUserController,
};
