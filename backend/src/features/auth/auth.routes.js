// Layer: route (auth feature).
// Owns mapping POST /login to the controller. Public — no auth
// middleware here; auth is applied to the other features in app.js.
const express = require('express');
const authController = require('./auth.controller');

const router = express.Router();
router.post('/login', authController.login);

module.exports = router;
