const express = require('express');
const router = express.Router();

const {
  updateUserPassword,
  getAllUsers,
  getSingleUser,
  updateUserAdmin,
} = require('../controllers/userController');

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router.get('/', authenticateUser, authorizePermissions('admin'), getSingleUser);

router.get(
  '/get-all-users',
  authenticateUser,
  authorizePermissions('admin'),
  getAllUsers,
  getSingleUser
);

router.patch('/updateUserPassword', authenticateUser, updateUserPassword);

router.post(
  '/update-user-admin',
  authenticateUser,
  authorizePermissions('admin'),
  updateUserAdmin
);

module.exports = router;
