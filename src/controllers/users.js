'use strict';
const bcrypt = require('bcrypt');
const {
  createUser,
  getUserById,
  getUserByEmail,
} = require('../database/users');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const { generateError } = require('../../helpers');

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
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      throw generateError(validation.error, 400);
    }

    const newUser = await createUser(
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

    req.userId = user.id;
    console.log(req.userId);

    res.send({
      status: 'ok',
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  newUserController,
  getUserController,
  loginController,
};
