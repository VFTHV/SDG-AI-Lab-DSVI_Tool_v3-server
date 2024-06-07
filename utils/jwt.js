const jwt = require('jsonwebtoken');

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const createJWTforHeader = ({ payload, expiresIn }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};

module.exports = { isTokenValid, createJWTforHeader };
