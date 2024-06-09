const jwt = require('jsonwebtoken');

const createJWTforCookie = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWTforCookie({ payload: { user } });
  const refreshTokenJWT = createJWTforCookie({
    payload: { user, refreshToken },
  });

  const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};
// const attachSingleCookieToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie('token', token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === 'production',
//     signed: true,
//   });
// };

const createJWT = ({ payload, expiresIn }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};

const createAccessAndRefreshJWT = ({ user, refreshToken }) => {
  const accessJWT = createJWT({
    payload: { user },
    expiresIn: Number(process.env.ACCESS_JWT_EXPIRES_IN),
  });
  const refreshJWT = createJWT({
    payload: { user, refreshToken },
    expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
  });

  return { accessJWT, refreshJWT };
};

module.exports = {
  isTokenValid,
  createAccessAndRefreshJWT,
};
