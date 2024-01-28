const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  authenticateRouting,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.get('/routing', authenticateRouting);

module.exports = router;
