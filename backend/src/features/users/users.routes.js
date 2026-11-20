// Layer: route (users feature).
// Owns mapping HTTP methods to the controller. Auth is applied in
// app.js when this router is mounted under /api/users.
const express = require('express');
const usersController = require('./users.controller');

const router = express.Router();
router.get('/', usersController.list);
router.get('/:id', usersController.get);

module.exports = router;
