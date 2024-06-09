const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');
const { createJWTforHeader } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const refreshToken = req.headers['x-refresh-token'];
  const authHeader = req.headers.authorization;

  //  change all error messages to invalid credentials

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError.UnauthenticatedError('No token provided');
  }

  const accessToken = authHeader.split(' ')[1];
  // check if accessToken is valid
  try {
    const payload = isTokenValid(accessToken);
    console.log('accessToken is valid');
    req.user = payload.user;

    next();
    return;
  } catch (error) {
    console.log('Access token verification failed: ', error.message);
  }

  if (!refreshToken) {
    throw new CustomError.UnauthenticatedError('No refresh token provided');
  }

  // if !refreshToken, then check if refreshToken is valid
  try {
    console.log('accessToken is invalid');
    const payload = isTokenValid(refreshToken);

    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Invalid refresh token');
    }

    // creating new tokens and persisting refreshToken to database
    const accessTokenJWT = createJWTforHeader({
      payload: { user: payload.user },
      expiresIn: 30,
    });
    const refreshTokenJWT = createJWTforHeader({
      payload: { user: payload.user, refreshToken: existingToken.refreshToken },
      expiresIn: 24 * 60 * 60 * 1,
    });

    // console.log('updating refreshToken');
    // const filter = { user: payload.user.userId };
    // const update = { refreshToken: refreshTokenJWT };
    // await Token.findOneAndUpdate(filter, update);

    req.tokens = { accessToken: accessTokenJWT, refreshToken: refreshTokenJWT };
    req.user = payload.user;

    next();
  } catch (error) {
    // if token is invalid then logout all users by removing the refreshToken from
    // database
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
