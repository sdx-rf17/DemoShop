// Layer: route (stats feature).
// Owns mapping GET /overview to the controller. Auth is applied in
// app.js when this router is mounted under /api/stats.
const express = require('express');
const statsController = require('./stats.controller');

const router = express.Router();
router.get('/overview', statsController.overview);

module.exports = router;
