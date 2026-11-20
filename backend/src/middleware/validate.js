// Layer: middleware — small body/param validation helpers.
// Owns the tiny checks controllers and services reuse. Business rules
// (which values are allowed) live in services, not here.
const { ApiError } = require('../common/errors');

function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length > 0) {
    throw new ApiError(400, missing.join(', ') + ' are required');
  }
}

function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'Invalid id');
  }
  return id;
}

module.exports = { requireFields, parseId };
