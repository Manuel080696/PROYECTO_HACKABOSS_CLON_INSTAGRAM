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
  updateRecoverUserPassword,
  getUserByRecoverCode,
  updateResetUserPassword,
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
      password2: joi.string().min(8).required(),
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
      birthDay
    );
    res.send({
      status: 201,
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
      throw generateError('You must send an email and a password', 400);
    }
    const [user] = await getUserByEmail(email);

    const validationPassHas = await bcrypt.compare(password, user.password);

    if (!validationPassHas) {
      throw generateError('Password does not match', 401);
    }

    const payLoad = { id: user.id };

    const token = jwt.sign(payLoad, process.env.SECRET, {
      expiresIn: '1d',
    });

    res.send({
      status: 'ok',
      data: [
        {
          token,
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          UserName: user.userName,
          birthDay: user.birthDay,
          email,
          avatar: user.avatar,
        },
      ],
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
        'You do not have permissions to delete this user',
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
        'You do not have permissions to update this user',
        401
      );
    }
    const { name, lastName, userName, birthDay } = req.body;

    if (!name || !lastName || !userName || !birthDay) {
      throw generateError('You must submit all fields', 400);
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
    } else {
      updateAvatar = avatar.avatar;
    }
    await updateUser(
      req.userId,
      updateAvatar,
      name,
      lastName,
      userName,
      birthDay
    );
    res.send({
      status: 'ok',
      message: `El usuario con id:${req.userId} ha sido actualizado`,
      data: [{ name, lastName, userName, birthDay, updateAvatar }],
    });
  } catch (error) {
    next(error);
  }
};

//Controller para recuperar el password

const recorverUserPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
  

    if (!email) {
      throw generateError('email is missing', 400);
    }

    await getUserByEmail(email);

    //generamos un codigo de recuperación
    const { v4: uuidv4 } = require('uuid');
    const recoverCode = uuidv4();

    await updateRecoverUserPassword(recoverCode, email);

    //enviamos el codigo por email
    const mailBody = `
      Se solicitó un cambio de contraseña para el usuario registrado con este email en InstaClone.
      El código de recuperación es: ${recoverCode}
      Si no fuiste tu el que solicitó el cambio, por favor ignora este email.
      Puedes hacer login con tu password habitual.
      Gracias!
      `;
    const { sendMail } = require('../../helpers.js');
    await sendMail(email, 'Cambio de contraseña en InstaClone', mailBody);

    res.status(200).send({
      status: 'ok',
      message: 'email sent',
    });
  } catch (error) {
    next(error);
  }
};

//Controller para resetear el password

const resetUserPassword = async (req, res, next) => {
  try {
    const { recoverCode, newPassword } = req.body;
  

    if (!recoverCode || !newPassword || newPassword.length < 8) {
      throw generateError(
        'Missing fields or new password is less than 8 characters',
        400
      );
    }

    const user = await getUserByRecoverCode(recoverCode);

    // Establecer la contraseña proporcionada a ese usuario
    await updateResetUserPassword(newPassword, user[0].id);

    res.send({
      status: 'ok',
      message: 'User password changed',
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
  recorverUserPassword,
  resetUserPassword,
};
