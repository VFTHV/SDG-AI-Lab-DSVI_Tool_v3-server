const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');
const { createAccessAndRefreshJWT } = require('../utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  const refreshToken = req.headers['x-refresh-token'];
  const authHeader = req.headers.authorization;
  console.log('accessToken: ', authHeader.substring(0, 10));
  console.log('refreshToken: ', refreshToken.substring(0, 10));
  //  change all error messages to invalid credentials

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError.UnauthenticatedError('No token provided');
  }

  // CHECK VALIDITY OF ACCESS TOKEN
  const accessToken = authHeader.split(' ')[1];
  try {
    // ADD LOGICS IF TOKEN IS INVALID, AND NOT EXPIRED
    const payload = isTokenValid(accessToken);
    console.log('accessToken is valid');
    req.user = payload.user;

    req.tokens = { accessJWT: accessToken, refreshJWT: refreshToken };

    next();
    return;
  } catch (error) {
    console.log('Access token verification failed: ', error.message);
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
    // BLOCK ACCOUNT IF WRONG REFRESH TOKEN PROVIDED
    if (refreshToken) {
      const decodedRefreshToken = jwt.decode(refreshToken);
      if (decodedRefreshToken && decodedRefreshToken.user) {
        const filter = { user: decodedRefreshToken.user.userId };
        const update = { isValid: false };
        await Token.findOneAndUpdate(filter, update);
      }
    }
    console.log('Error messge: ', error.name);
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access the route'
      );
    }
    next();
  };
};

module.exports = { authorizePermissions, authenticateUser };
