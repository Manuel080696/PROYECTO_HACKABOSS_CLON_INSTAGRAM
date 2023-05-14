'use strict';
const bcrypt = require('bcrypt');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');
const { generateError, saveAvatar } = require('../../helpers');
const {
  createUserNoAvatar,
  createUser,
  getUserById,
  getUserByEmail,
  deleteUserById,
  updateUser,
} = require('../database/users');
const joi = require('joi');
const jwt = require('jsonwebtoken');

//Controller para dar de alta al usuario
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
    if (!req.files || !req.files.avatar) {
      const newUser = await createUserNoAvatar(
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
    }

    const userAvatar = await saveAvatar(req.files.avatar);
    const newUser = await createUser(
      userAvatar,
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

//Controller para mostrar los datos de un usuario por su id
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

//Controller para el login del usuario
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

//Controller para eliminar un usuario
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

//Controller para actualizar un usuario
const updateUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.userId !== parseInt(id)) {
      throw generateError(
        'No tienes permisos para actualizar a este usuario',
        401
      );
    }
    const { name, lastName, userName, birthDay } = req.body;
    if (!name || !lastName || !userName || !birthDay) {
      throw generateError('Debes enviar todos los campos', 400);
    }
    let updateAvatar;
    if (req.files && req.files.avatar) {
      const image = sharp(req.files.avatar.data);
      const uploadsDir = path.join(__dirname, '../uploads/avatar');
      image.resize(320);
      updateAvatar = `${nanoid(24)}.jpg`;
      await image.toFile(path.join(uploadsDir, updateAvatar));
    }
    await updateUser(id, updateAvatar, name, lastName, userName, birthDay);
    res.send({
      status: 'ok',
      message: `El usuario con id:${id} ha sido actualizado`,
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
  updateUserController,
};
