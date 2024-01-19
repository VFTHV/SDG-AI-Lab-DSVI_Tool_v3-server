const mongoose = require('mongoose');

// connect to DB functionality
// connect to DB functionality
// connect to DB functionality
// connect to DB functionality
// connect to DB functionality

const connectDB = (url) => {
  return mongoose.connect(url, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  });
};

module.exports = connectDB;
