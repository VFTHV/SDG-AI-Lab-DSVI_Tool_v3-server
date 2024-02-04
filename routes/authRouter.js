const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  logout,
  showCurrentUser,
  updateUserPassword,
} = require('../controllers/authController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.get('/logout', logout);
router.get('/routing', authenticateUser, showCurrentUser);
router.patch('/updateUserPassword', authenticateUser, updateUserPassword);

module.exports = router;
