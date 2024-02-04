const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const authenticateUser = async (req, res, next) => {
  const { token } = req.signedCookies;
  // extend cookies validity when this runs
  // it means person uses app

  if (!token) {
    throw new CustomError.UnauthenticatedError(
      'Authentication Invalid. Please login'
    );
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError(
      'Authentication Invalid. Please login'
    );
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
