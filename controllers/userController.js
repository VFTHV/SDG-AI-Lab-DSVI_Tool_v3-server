const User = require('../models/User');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { hashPassword } = require('../utils');
const validator = require('validator');

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(
      'Please provide correct Old Password'
    );
  }
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();
  // cannot use previously used old passwords
  // new password cannot be same as current
  res.status(StatusCodes.OK).json({ msg: 'Password Updated' });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  // attach pagination here
  res.status(StatusCodes.OK).send({ users });
};

const getSingleUser = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    throw new CustomError.BadRequestError('Please provide user email');
  }

  const isEmail = validator.isEmail(email);
  if (!isEmail) {
    throw new CustomError.BadRequestError(
      `Please provide correct email syntax`
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError(
      `User with email ${email} was not found`
    );
  }

  res.status(StatusCodes.OK).send({ user });
};

const updateUser = async (req, res) => {
  // updating user details here
};
const deleteUser = async (req, res) => {
  // deleting user here
};

module.exports = {
  updateUserPassword,
  getAllUsers,
  getSingleUser,
};
