const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const { token } = req.signedCookies;
  // extend cookies validity when this runs
  // it means person uses app
  console.log('signedCookies: ', req.signedCookies);
  console.log('origin: ', req.headers.origin);
  // token =
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9zaCIsImVtYWlsIjoiam9zaEBnbWFpbC5jb20iLCJ1c2VySWQiOiI2NWMwMWQ4MmViZmY1N2MyYTc2ZTUxNGIiLCJyb2xlIjoiYWRtaW4iLCJjb3VudHJpZXMiOlsiVGFqaWtpc3RhbiJdLCJpYXQiOjE3MDg4MTc5MjQsImV4cCI6MTcxMTQwOTkyNH0.AOdTo-yjfNao43TLRJVSzipeNGX4r3pIdPtuk6o7pZg';

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
