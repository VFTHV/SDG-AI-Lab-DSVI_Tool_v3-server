const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const authenticateUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
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
    res.status(StatusCodes.OK).send({ isAuthenticated: true });
    // next();
  };
};

module.exports = { authorizePermissions, authenticateUser };
