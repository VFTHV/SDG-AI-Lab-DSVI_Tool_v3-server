const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { sendVerificationEmail } = require('../utils');
const { createTokenUser, createAccessAndRefreshJWT } = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
  const { name, password, countries, role } = req.body;
  const email = req.body.email.toLowerCase();

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError(
      'Account with this email already exists'
    );
  }

  const verificationToken = crypto.randomBytes(40).toString('hex');

  // const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password,
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

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }

  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = '';

  // check for existing token and send response
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    console.log('login: creating new refreshToken');
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const { accessJWT, refreshJWT } = createAccessAndRefreshJWT({
      user: tokenUser,
      refreshToken: newRefreshToken,
    });

    const filter = { user: tokenUser.userId };
    const update = { refreshToken: newRefreshToken };
    await Token.findOneAndUpdate(filter, update);

    res.status(StatusCodes.OK).json({
      user: tokenUser,
      tokens: { accessJWT, refreshJWT },
    });

    return;
  }

  // if no existing token: create one and send same response
  refreshToken = crypto.randomBytes(40).toString('hex');
  console.log('creating a refreshToken');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  const { accessJWT, refreshJWT } = createAccessAndRefreshJWT({
    user: tokenUser,
    refreshToken: refreshToken,
  });

  // use .env lifetime variables here for each type of token
  // const accessTokenJWT = createAccessAndRefreshJWT({
  //   payload: { user: tokenUser },
  //   expiresIn: 100,
  // });
  // const refreshTokenJWT = createAccessAndRefreshJWT({
  //   payload: { user: tokenUser, refreshToken },
  //   expiresIn: 24 * 60 * 60 * 1,
  // });

  res
    .status(StatusCodes.OK)
    .json({ user: tokenUser, tokens: { accessJWT, refreshJWT } });
};

// const logout = async (req, res) => {
//   res.cookie('token', 'logout', {
//     httpOnly: true,
//     expires: new Date(Date.now() + 10 * 1000),
//   });

//   res.status(StatusCodes.OK).send({ msg: 'User logged out' });
// };

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user, tokens: req.tokens });
};

module.exports = {
  register,
  login,
  verifyEmail,
  // logout,
  showCurrentUser,
};
