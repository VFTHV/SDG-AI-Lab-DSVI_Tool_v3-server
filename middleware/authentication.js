const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');

const authenticateUser = async (req, res, next) => {
  const refreshToken = req.headers['x-refresh-token'];
  const authHeader = req.headers.authorization;

  //  change all error messages to invalid credentials

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError.UnauthenticatedError('No token provided');
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const payload = isTokenValid(accessToken);
    req.user = payload.user;
    console.log(payload);
    next();
  } catch (error) {
    console.log('Access token verification failed: ', error.message);
  }

  if (!refreshToken) {
    throw new CustomError.UnauthenticatedError('No refresh token provided');
  }

  try {
    const payload = isTokenValid(refreshToken);

    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Invalid refresh token');
    }

    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
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
