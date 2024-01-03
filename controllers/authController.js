const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { sendVerificationEmail } = require('../utils');

const crypto = require('crypto');
const CustomError = require('../errors');

const register = async (req, res) => {
  const { email, name, password } = req.body;
  console.log('register user triggered');

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }
  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
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
    user: { name: user.name, email: user.email, verificationToken },
  });
};

const verifyEmail = async (req, res) => {
  console.log('verify email triggered');
  console.log('verify email triggered');
  console.log('verify email triggered');
  console.log('verify email triggered');
  console.log('verify email triggered');
  console.log(req.body);
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
      'Verification failed. Tokens not matching'
    );
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = '';

  await user.save();
  console.log('user save');
  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};

const login = async (req, res) => {
  console.log('login user triggered');
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

  const token = user.createJWT();

  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.name, email: user.email, token } });
};

module.exports = { register, login, verifyEmail };
