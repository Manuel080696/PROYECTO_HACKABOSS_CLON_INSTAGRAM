const { userExists } = require('../database/users');
const { generateError } = require('../../helpers');

const isUserExists = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [user] = await userExists(id);
    if (user.length === 0) {
      throw generateError('User does not exist', 404);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isUserExists };
