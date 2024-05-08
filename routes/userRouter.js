const express = require('express');
const router = express.Router();

const {
  updateUserPassword,
  getUsers,
  getUserById,
  updateUserAdmin,
  deleteUser,
  updateUser,
} = require('../controllers/userController');

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router.get('/', authenticateUser, authorizePermissions('admin'), getUsers);
router.get(
  '/get-user',
  authenticateUser,
  authorizePermissions('admin'),
  getUserById
);

router.patch('/update-user-password', authenticateUser, updateUserPassword);
router.patch('/update-user', authenticateUser, updateUser);

router.post(
  '/update-user-admin',
  authenticateUser,
  authorizePermissions('admin'),
  updateUserAdmin
);

router.delete(
  '/delete-user',
  authenticateUser,
  authorizePermissions('admin'),
  deleteUser
);

module.exports = router;
