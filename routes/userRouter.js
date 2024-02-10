const express = require('express');
const router = express.Router();

const {
  updateUserPassword,
  getAllUsers,
  getSingleUser,
} = require('../controllers/userController');

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router.patch('/updateUserPassword', authenticateUser, updateUserPassword);

router.get(
  '/get-all-users',
  authenticateUser,
  authorizePermissions('admin'),
  getAllUsers,
  getSingleUser
);

router.get(
  '/user',
  authenticateUser,
  authorizePermissions('admin'),
  getSingleUser
);

module.exports = router;
