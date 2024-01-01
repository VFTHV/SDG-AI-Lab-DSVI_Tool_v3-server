const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const CustomError = require('../errors');

const register = async (req, res) => {
  const { email, name, password } = req.body;
  console.log(Date.now(), ' register user triggered');

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }
  const verificationToken = crypto.randomBytes(40).toString('hex');

  try {
    await sendEmail();
  } catch (error) {
    throw new CustomError.ServerError(
      `Server returned following error: ${error}. Please try again`
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
  });

  res.status(StatusCodes.CREATED).json({
    user: { name: user.name, email: user.email, verificationToken },
  });
};

const verifyEmail = async (req, res) => {
  console.log(Date.now(), ' verify email triggered');
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  if (user.isVerified) {
    throw new CustomError.BadRequestError(
      'This email has already been verified'
    );
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }
  console.log('token verified');

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
