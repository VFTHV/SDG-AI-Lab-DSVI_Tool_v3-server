const CustomAPIError = require('../errors/custom-api');
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ err });
};

module.exports = errorHandlerMiddleware;
