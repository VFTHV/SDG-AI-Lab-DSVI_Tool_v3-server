const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');
const { createAccessAndRefreshJWT } = require('../utils');
const crypto = require('crypto');

const authenticateUser = async (req, res, next) => {
  const refreshToken = req.headers['x-refresh-token'];
  const authHeader = req.headers.authorization;
  console.log('authHeader: ', authHeader.substring(0, 10));
  console.log('refreshToken: ', refreshToken.substring(0, 10));
  //  change all error messages to invalid credentials

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError.UnauthenticatedError('No token provided');
  }

  // CHECK VALIDITY OF ACCESS TOKEN
  const accessToken = authHeader.split(' ')[1];
  try {
    const payload = isTokenValid(accessToken);
    console.log('accessToken is valid');
    req.user = payload.user;

    req.tokens = { accessJWT: accessToken, refreshJWT: refreshToken };

    next();
    return;
  } catch (error) {
    console.log('Access token verification failed: ', error.message);
  }

  if (!refreshToken) {
    throw new CustomError.UnauthenticatedError('No refresh token provided');
  }

  // CHECK VALIDITY OF REFRESH TOKEN
  try {
    const payload = isTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      // RESET REFRESH TOKEN
      // possibly set isValid = false
      console.log('resetting refreshToken');
      const filter = { user: payload.user.userId };
      const update = { refreshToken: '' };
      await Token.findOneAndUpdate(filter, update);
      throw new CustomError.UnauthenticatedError('Invalid refresh token');
    }

    // ROTATE REFRESH TOKEN
    console.log('auth middleware: creating new refreshToken');
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const { accessJWT, refreshJWT } = createAccessAndRefreshJWT({
      user: payload.user,
      refreshToken: newRefreshToken,
    });

    const filter = { user: payload.user.userId };
    const update = { refreshToken: newRefreshToken };
    await Token.findOneAndUpdate(filter, update);

    req.tokens = { accessJWT, refreshJWT };
    req.user = payload.user;

    next();
  } catch (error) {
    console.log('Error messge: ', error.message);
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
