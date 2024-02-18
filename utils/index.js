const sendVerificationEmail = require('./sendVerificationEmail');
const { attachCookiesToResponse, isTokenValid } = require('./jwt');
const { hashPassword } = require('./password');
const createTokenUser = require('./createTokenUser');

module.exports = {
  sendVerificationEmail,
  attachCookiesToResponse,
  isTokenValid,
  hashPassword,
  createTokenUser,
};
