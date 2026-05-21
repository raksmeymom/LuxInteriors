const logger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500
        ? "\x1b[31m"
        : status >= 400
          ? "\x1b[33m"
          : status >= 300
            ? "\x1b[36m"
            : "\x1b[32m";
    const reset = "\x1b[0m";
    console.log(
      `${color}${req.method}${reset} ${req.originalUrl} ${color}${status}${reset} — ${ms}ms`,
    );
  });
  next();
};

module.exports = logger;
