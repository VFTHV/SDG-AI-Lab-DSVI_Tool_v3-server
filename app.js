require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// error handlers
const notFountMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());

// routers
app.get('/', (req, res) => {
  res.send('jobs api');
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
