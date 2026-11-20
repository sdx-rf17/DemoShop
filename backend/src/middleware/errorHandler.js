// Layer: middleware — central error handler.
// Owns turning errors into JSON responses. ApiError keeps its status
// and message; anything else becomes a 500 so internals never leak.
// This is the only place that sends error responses.
const { ApiError } = require('../common/errors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

function notFound(_req, _res, next) {
  return next(new ApiError(404, 'Not found'));
}

module.exports = { errorHandler, notFound };
