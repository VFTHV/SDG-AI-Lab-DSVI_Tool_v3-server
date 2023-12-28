require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// extra security packages
const cors = require('cors');
const helmet = require('helmet');
// const xss = require('xss-clean');
// extra safety factor
// extra safety factor
// extra safety factor
// extra safety factor
const rateLimiter = require('express-rate-limit');

// connectDB
const connectDB = require('./db/connect');

const authenticateUser = require('./middleware/authentication');
// routers
const authRouter = require('./routes/authRouter');

// error handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
// extra packages
app.use(cors());

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
