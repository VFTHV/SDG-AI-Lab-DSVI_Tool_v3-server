const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  authenticateRouting,
  logout,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.get('/routing', authenticateRouting);
router.get('/logout', logout);

module.exports = router;
