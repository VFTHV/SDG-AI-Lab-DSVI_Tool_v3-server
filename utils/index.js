const sendVerificationEmail = require('./sendVerificationEmail');
const { isTokenValid, createJWTforHeader } = require('./jwt');
const { hashPassword } = require('./password');
const createTokenUser = require('./createTokenUser');

module.exports = {
  sendVerificationEmail,
  createJWTforHeader,
  isTokenValid,
  hashPassword,
  createTokenUser,
};
