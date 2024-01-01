const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const register = async (req, res) => {
  const { email, name, password } = req.body;
  console.log('register user triggered');

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }
  const token = crypto.randomBytes(40).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    token,
  });

  await sendEmail();

  res.status(StatusCodes.CREATED).json({
    user: { name: user.name, email: user.email, token },
  });
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

module.exports = { register, login };
