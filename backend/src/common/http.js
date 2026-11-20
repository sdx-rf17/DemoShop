// Layer: common — Express helper.
// Owns asyncHandler: wraps an async controller so a thrown ApiError (or
// any error) is passed to next() instead of crashing the request.
// Controllers stay free of try/catch blocks.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
