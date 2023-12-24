const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

const register = async (req, res) => {
  console.log('register user triggered');
  console.log('new register controller');
  console.log('new register controller');
  console.log('new register controller');
  const user = await User.create({ ...req.body });
  const token = user.createJWT();

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
