const User = require('../models/User');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { createTokenUser, attachCookiesToResponse } = require('../utils');

const getUsers = async (req, res) => {
  const { email } = req.query;

  let searchTerm = null;
  if (email) {
    searchTerm = {
      email: { $regex: email, $options: 'i' },
    };
  }

  const users = await User.find(searchTerm).select('-password');

  if (!users.length) {
    throw new CustomError.NotFoundError(
      `Nothing matches search term "${email}"`
    );
  }
  // attach pagination here
  res.status(StatusCodes.OK).send({ users });
};

const getUserById = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    throw new CustomError.BadRequestError('No user ID provided');
  }

  const user = await User.findOne({ _id: userId }).select('-password');

  if (!user) {
    throw new CustomError.NotFoundError('User Not Found');
  }

  res.status(StatusCodes.OK).json({ user });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  //  redo this functionality by checking: const isPasswordCorrect = await user.comparePassword(password);
  if (oldPassword === newPassword) {
    throw new CustomError.BadRequestError('You cannot use previous password');
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(
      'Please provide correct Old Password'
    );
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Password Updated' });
};

// update user functionality

const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new CustomError.BadRequestError('Please provide name and email');
  }

  const user = await User.findOne({ _id: req.user.userId });

  if (user.email === email && user.name === name) {
    throw new CustomError.BadRequestError('You need to provide updated values');
  }

  user.email = email;
  user.name = name;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res
    .status(StatusCodes.OK)
    .json({ user: tokenUser, msg: 'Details updated successfully' });
};

const deleteUser = async (req, res) => {
  const { id: _id } = req.query;
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

  const user = await User.findOne({ _id });

  if (password) {
    user.password = password;
  }

  // assigning the rest of properties
  for (prop in otherProps) {
    if (Object.prototype.hasOwnProperty.call(otherProps, prop)) {
      user[prop] = otherProps[prop];
    }
  }

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'User updated successfully', user });
};

module.exports = {
  updateUserPassword,
  getUsers,
  getUserById,
  updateUserAdmin,
  deleteUser,
  updateUser,
};
