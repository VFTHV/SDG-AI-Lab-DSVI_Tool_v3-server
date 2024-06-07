const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.headers['x-refresh-token'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError.UnauthenticatedError('No token provided');
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const payload = isTokenValid(accessToken);
    req.user = payload.user;
    console.log(payload);
    next();
  } catch (_) {
    try {
      const payload = isTokenValid(refreshToken);

      const existingToken = await Token.findOne({
        user: payload.user.userId,
        refreshToken: payload.refreshToken,
      });
    } catch (error) {
      throw new CustomError.UnauthenticatedError(
        'Authentication Invalid. Please login'
      );
    }
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = { authorizePermissions, authenticateUser };
