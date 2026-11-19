/**
 * Global Error Handling Middleware
 * Catches unhandled errors from routes/controllers and ensures consistent JSON responses.
 */
const errorMiddleware = (err, req, res, next) => {
  // Log server-side error for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        data: null,
        message: 'Uploaded file exceeds the maximum allowed size limit.',
      });
    }
    return res.status(400).json({
      data: null,
      message: `File upload error: ${err.message}`,
    });
  }

  // Handle Malformed JSON body in requests
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      data: null,
      message: 'Malformed JSON payload in request body.',
    });
  }

  // Handle Sequelize validation errors if uncaught
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      data: null,
      message: err.errors?.[0]?.message || 'Database validation failed.',
    });
  }

  // Standard fallback
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    data: null,
    message: err.message || 'An internal server error occurred.',
  });
};

module.exports = errorMiddleware;
