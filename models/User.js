const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/password');

const allowedCountries = ['Tajikistan', 'Niger', 'Burkina Faso'];

const countryValidator = (countries) => {
  return (
    Array.isArray(countries) &&
    countries.length &&
    countries.every((country) => allowedCountries.includes(country))
  );
};

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    // trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    validate: {
      validator: function (value) {
        return value.length >= 6;
      },
      message: `Password is shorter than minimum allowed length of 6`,
    },
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  countries: {
    type: [String],
    required: true,
    validate: {
      validator: countryValidator,
      message: 'Please choose allowed countries',
    },
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: Date,
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// may need to delete the createJWT method

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

// add the 'save' hook with this.isModified('password') return

UserSchema.pre('save', async function () {
  console.log(this.modifiedPaths());

  if (!this.isModified('password')) return;
  console.log('modifying password');
  const salt = await bcrypt.genSalt(10);
  this.password = await hashPassword(this.password);
});

module.exports = mongoose.model('User', UserSchema);
