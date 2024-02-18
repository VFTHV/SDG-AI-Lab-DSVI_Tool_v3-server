const express = require('express');
const router = express.Router();

const {
  updateUserPassword,
  getAllUsers,
  getSingleUser,
  updateUserAdmin,
  deleteUser,
  updateUser,
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
