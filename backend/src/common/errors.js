// Layer: common — shared error type.
// Owns the ApiError class: an error with an HTTP status code that the
// central error handler turns into a JSON response.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

module.exports = { ApiError };
