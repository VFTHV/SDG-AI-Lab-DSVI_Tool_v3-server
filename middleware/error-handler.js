const errorHandlerMiddleware = (err, req, res, next) => {
  console.log('error handler middleware');
  res.send('error happened');
};

module.exports = errorHandlerMiddleware;
