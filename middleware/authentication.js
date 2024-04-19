const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const { token } = req.signedCookies;
  // extend cookies validity when this runs
  // it means person uses app
  console.log('signedCookies: ', req.signedCookies);
  console.log('cookies: ', req.cookies);
  console.log('origin: ', req.headers.origin);

  if (!token) {
    throw new CustomError.UnauthenticatedError(
      'Authentication Invalid. Please login'
    );
  }
  try {
    const { name, email, userId, role, countries } = isTokenValid({ token });
    req.user = { name, email, userId, role, countries };
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
