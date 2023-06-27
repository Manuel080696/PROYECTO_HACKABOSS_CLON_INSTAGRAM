'use strict';
const jwt = require('jsonwebtoken');
const { generateError } = require('../../helpers');

const isUserAuth = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError('You must login or register', 401);
    }
    let token;
    try {
      token = jwt.verify(authorization, process.env.SECRET);
    } catch {
      throw generateError('You must login again', 401);
    }
    req.userId = token.id;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isUserAuth };
