'use strict';
const bcrypt = require('bcrypt');

const { generateError, saveAvatar, deleteAvatar } = require('../../helpers');
const {
  createUser,
  getUserById,
  getUserByEmail,
  deleteUserById,
  updateUser,
  readAvatar,
} = require('../database/users');
const joi = require('joi');
const jwt = require('jsonwebtoken');

//Controller para dar de alta al usuario
const newUserController = async (req, res, next) => {
  try {
    const { name, lastName, userName, email, password, birthday } = req.body;
    const schema = joi.object().keys({
      name: joi.string().min(3).max(20).required(),
      lastName: joi.string().min(3).max(40).required(),
      userName: joi.string().min(3).max(20).required(),
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
      password2: joi.string().min(8).required(),
      birthday: joi.date(),
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
    let userAvatar;
    if (req.files && req.files.avatar) {
      userAvatar = await saveAvatar(req.files.avatar);
    } else {
      userAvatar = null;
    }

    const newUser = await createUser(
      userAvatar,
      name,
      lastName,
      userName,
      email,
      password,
      birthday
    );
    res.send({
      status: 201,
      message: `Usuario ${newUser} creado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

const getMeUserController = async (req, res, next) => {
  try {
    const user = await getUserById(req.userId);

    res.send({
      status: 'ok',
      data: user,
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

    console.log(user);
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
      data: { token, id: user.id, name: user.name, email },
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
    if (!req.userId) {
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
    const avatar = await readAvatar(req.userId);
    if (req.files && req.files.avatar) {
      if (avatar.avatar === null) {
        updateAvatar = await saveAvatar(req.files.avatar);
      } else {
        await deleteAvatar(avatar.avatar);
        updateAvatar = await saveAvatar(req.files.avatar);
      }
      await updateUser(
        req.userId,
        updateAvatar,
        name,
        lastName,
        userName,
        birthDay
      );
    }
    res.send({
      status: 'ok',
      message: `El usuario con id:${req.userId} ha sido actualizado`,
      data: { name, lastName, userName, birthDay },
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
  getMeUserController,
};
