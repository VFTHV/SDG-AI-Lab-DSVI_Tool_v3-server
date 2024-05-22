const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError.UnauthenticatedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  //  auth with refresh token
  //  auth with refresh token
  //  auth with refresh token
  //  auth with refresh token
  //  auth with refresh token
  try {
    // const { name, email, userId, role, countries } = isTokenValid({ token });
    // req.user = { name, email, userId, role, countries };
    // next();
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
