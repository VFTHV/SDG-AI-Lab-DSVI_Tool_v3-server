const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { sendVerificationEmail } = require('../utils');
const {
  attachCookiesToResponse,
  hashPassword,
  isTokenValid,
} = require('../utils');

const crypto = require('crypto');
const CustomError = require('../errors');

const register = async (req, res) => {
  const { email, name, password } = req.body;

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

  const tokenUser = { name: user.name, userId: user._id, role: user.role };

  attachCookiesToResponse({ res, user: tokenUser });

  // const token = user.createJWT();

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const authenticateRouting = async (req, res) => {
  const { token } = req.cookies;

  try {
    const tokenVerified = isTokenValid({ token });
    // can attach user: tokenVerified to send() later
    res.status(StatusCodes.OK).send({ isAuthenticated: true });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).send({ isAuthenticated: false });
  }
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(StatusCodes.OK).send({ msg: 'User logged out' });
};

const updateUser = async (req, res) => {
  // updating password here
  // updating password here
  // updating password here
  // updating password here
  // updating password here
};

module.exports = { register, login, verifyEmail, authenticateRouting, logout };
