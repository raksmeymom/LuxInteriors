const errorHandler = (err, req, res, next) => {
  console.error("\x1b[31m[ERROR]\x1b[0m", err.stack || err.message);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
