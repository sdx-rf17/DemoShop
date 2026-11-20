// Layer: route (orders feature).
// Owns mapping HTTP methods to the controller. Auth is applied in
// app.js when this router is mounted under /api/orders.
const express = require('express');
const ordersController = require('./orders.controller');

const router = express.Router();
router.get('/', ordersController.list);
router.get('/:id', ordersController.get);
router.put('/:id', ordersController.update);

module.exports = router;
