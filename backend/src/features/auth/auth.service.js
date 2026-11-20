// Layer: service (auth feature).
// Owns login business logic: find the user, compare the password,
// sign a JWT. Knows nothing about HTTP or SQL.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const { ApiError } = require('../../common/errors');
const authRepository = require('./auth.repository');

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function login(email, password) {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!normalizedEmail || !password) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const user = await authRepository.findUserByEmail(normalizedEmail);
  if (!user) throw new ApiError(401, 'Invalid email or password');
  const ok = await bcrypt.compare(String(password), user.password_hash);
  if (!ok) throw new ApiError(401, 'Invalid email or password');
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
  return { token, user: publicUser(user) };
}

module.exports = { login, publicUser };
