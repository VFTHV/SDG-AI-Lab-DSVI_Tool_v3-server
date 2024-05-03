const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { sendVerificationEmail } = require('../utils');
const { attachCookiesToResponse, hashPassword } = require('../utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, password, countries, role } = req.body;
  const email = req.body.email.toLowerCase();
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

  const origin = 'https://www.sdgailab-dsvi.com/';
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
  const { password } = req.body;
  const email = req.body.email.toLowerCase();
  console.log(email);
  // for dev only
  // const waiting = (delay) => {
  //   return new Promise((res) => {
  //     setTimeout(res, delay);
  //   });
  // };

  // await waiting(15000);

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  //  compare password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const isTokenVerified = user.isVerified;
  if (!isTokenVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }

  const tokenUser = {
    name: user.name,
    email: user.email,
    userId: user._id,
    role: user.role,
    countries: user.countries,
  };

  // attachCookiesToResponse({ res, user: tokenUser });

  const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  console.log('login');

  res.status(StatusCodes.OK).json({ user: tokenUser, token });
};

// const logout = async (req, res) => {
//   res.cookie('token', 'logout', {
//     httpOnly: true,
//     expires: new Date(Date.now() + 10 * 1000),
//   });

//   res.status(StatusCodes.OK).send({ msg: 'User logged out' });
// };

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

module.exports = {
  register,
  login,
  verifyEmail,
  // logout,
  showCurrentUser,
};
