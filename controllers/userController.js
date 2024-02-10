const User = require('../models/User');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { hashPassword } = require('../utils');
const validator = require('validator');

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
    throw new CustomError.BadRequestError(`Invalid Email Format`);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError(
      `User with email ${email} was not found`
    );
  }

  res.status(StatusCodes.OK).send({ user });
};

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

const updateUser = async (req, res) => {
  // updating user details here
};
const deleteUser = async (req, res) => {
  const { _id } = req.body;

  const user = await User.findOne({ _id });

  if (!user) {
    throw new CustomError.NotFoundError('Could not find user');
  }

  try {
    await User.findByIdAndDelete(_id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    console.log('deleteUser error: ', error);
    throw new CustomError.ServerError('Internal Server Error');
  }
};

const updateUserAdmin = async (req, res) => {
  const { password, _id, ...otherProps } = req.body;

  try {
    const user = await User.findOne({ _id });

    if (password) {
      console.log('updating password with: ', password);
      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword;
    }

    // assigning the rest of properties
    for (prop in otherProps) {
      if (Object.prototype.hasOwnProperty.call(otherProps, prop)) {
        user[prop] = otherProps[prop];
      }
    }

    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'User updated successfully', user });
  } catch (error) {
    console.log('Error in updateUserAdmin: ', error);
    throw new CustomError.ServerError('Internal Server Error');
  }
};

module.exports = {
  updateUserPassword,
  getAllUsers,
  getSingleUser,
  updateUserAdmin,
  deleteUser,
};
