// Layer: service (users feature).
// Owns user business rules. Today that is only: an unknown user is a
// 404. Knows nothing about HTTP or SQL.
const { ApiError } = require('../../common/errors');
const usersRepository = require('./users.repository');

async function listUsers() {
  return usersRepository.findAll();
}

async function getUser(id) {
  const user = await usersRepository.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

module.exports = { listUsers, getUser };
