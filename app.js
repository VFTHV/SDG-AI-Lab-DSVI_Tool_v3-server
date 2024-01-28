require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// rest of the packages

// const helmet = require('helmet');
// const xss = require('xss-clean');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// const rateLimiter = require('express-rate-limit');

// database
const connectDB = require('./db/connect');

// const authenticateUser = require('./middleware/authentication');

// routes
const authRouter = require('./routes/authRouter');

// error handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// extra packages
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// options so that DSVI nextJS front-end could receive cookies
const corsOptions = {
  origin: 'http://localhost:3001',
  credentials: true,
};

app.use(cors(corsOptions));

// routes
app.use('/api/v1/auth', authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
