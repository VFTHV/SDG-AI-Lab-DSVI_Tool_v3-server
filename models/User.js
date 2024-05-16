const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validatorLib = require('validator');
const { hashPassword } = require('../utils/password');

const allowedCountries = ['Tajikistan', 'Niger', 'Burkina Faso'];

const countryValidator = (countries) => {
  return (
    Array.isArray(countries) &&
    countries.length &&
    countries.every((country) => allowedCountries.includes(country))
  );
};

const passwordRequirements = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true,
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
        const isStrongPassword = validatorLib.isStrongPassword(
          value,
          passwordRequirements
        );
        const hasNoSpaces = !validatorLib.contains(value, ' ');

        return isStrongPassword && hasNoSpaces;
      },
      message: `Weak password. Requirements:  min length: 8, min lowercase: 1, min uppercase: 1, min numbers: 1, min symbols: 1,`,
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
// may need to delete the createJWT method
// may need to delete the createJWT method
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
  this.password = await hashPassword(this.password);
});

module.exports = mongoose.model('User', UserSchema);
