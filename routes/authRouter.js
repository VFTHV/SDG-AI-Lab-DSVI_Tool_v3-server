const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  logout,
} = require('../controllers/authController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.get('/routing', authenticateUser, authorizePermissions('user'));
router.get('/logout', logout);

module.exports = router;
