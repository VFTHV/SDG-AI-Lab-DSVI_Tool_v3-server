const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { sendVerificationEmail } = require('../utils');
const { attachCookiesToResponse, hashPassword } = require('../utils');

const crypto = require('crypto');
const CustomError = require('../errors');

const register = async (req, res) => {
  const { email, name, password, countries, role } = req.body;
  console.log(req.body);

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError(
      'Account with this email already exists'
    );
  }

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    countries,
    role,
    verificationToken,
  });

  const origin = 'http://localhost:3001';
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
      userId: user._id,
      role: user.role /*, verificationToken*/,
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError(
      'Verification failed no such user'
    );
  }

  if (user.isVerified) {
    throw new CustomError.BadRequestError(
      'This email has already been verified'
    );
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError(
      'Verification failed. Tokens do not match'
    );
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  //  compare password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const isTokenVerified = user.isVerified;
  if (!isTokenVerified) {
    throw new UnauthenticatedError('Please verify your email');
  }

  const tokenUser = {
    name: user.name,
    userId: user._id,
    role: user.role,
    countries: user.countries,
  };
  attachCookiesToResponse({ res, user: tokenUser });

  // const token = user.createJWT();

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(StatusCodes.OK).send({ msg: 'User logged out' });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
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
  // deleting user here
  // deleting user here
  // deleting user here
  // deleting user here
  // deleting user here
};

module.exports = {
  register,
  login,
  verifyEmail,
  logout,
  showCurrentUser,
  updateUserPassword,
};
