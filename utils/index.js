const sendVerificationEmail = require('./sendVerificationEmail');
const { attachCookiesToResponse, isTokenValid } = require('./jwt');
const { hashPassword } = require('./password');

module.exports = {
  sendVerificationEmail,
  attachCookiesToResponse,
  isTokenValid,
  hashPassword,
};
